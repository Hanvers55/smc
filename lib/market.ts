// Helper untuk mapping simbol pair ke TradingView & TwelveData, dan ambil candle data live.

export type Candle = {
  time: string; // ISO
  open: number;
  high: number;
  low: number;
  close: number;
};

const CRYPTO_TICKERS = ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "DOGE", "AVAX", "LTC", "LINK"];

/** "EURUSD" -> "FX:EURUSD", "BTCUSD" -> "BINANCE:BTCUSDT", "XAUUSD" -> "OANDA:XAUUSD" */
export function toTradingViewSymbol(pair: string): string {
  const p = pair.toUpperCase();
  if (p === "XAUUSD") return "OANDA:XAUUSD";
  if (p === "XAGUSD") return "OANDA:XAGUSD";
  const base = p.slice(0, p.length - 3);
  const quote = p.slice(p.length - 3);
  if (CRYPTO_TICKERS.includes(base)) {
    const q = quote === "USD" ? "USDT" : quote;
    return `BINANCE:${base}${q}`;
  }
  return `FX:${p}`;
}

/** "EURUSD" -> "EUR/USD", "BTCUSD" -> "BTC/USD", "XAUUSD" -> "XAU/USD" */
export function toTwelveDataSymbol(pair: string): string {
  const p = pair.toUpperCase();
  if (p.length === 6) {
    return `${p.slice(0, 3)}/${p.slice(3)}`;
  }
  // fallback: try splitting known crypto tickers
  for (const t of CRYPTO_TICKERS) {
    if (p.startsWith(t)) {
      return `${t}/${p.slice(t.length)}`;
    }
  }
  return p;
}

export async function fetchCandles(
  symbol: string,
  interval: "1min" | "5min" | "15min" | "1h",
  outputsize: number,
  apiKey: string
): Promise<Candle[]> {
  const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
    symbol
  )}&interval=${interval}&outputsize=${outputsize}&apikey=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (data.status === "error" || !Array.isArray(data.values)) {
    throw new Error(data.message || "Gagal mengambil data harga dari TwelveData");
  }

  // TwelveData returns newest-first; reverse to oldest-first
  const candles: Candle[] = data.values
    .map((v: any) => ({
      time: v.datetime,
      open: parseFloat(v.open),
      high: parseFloat(v.high),
      low: parseFloat(v.low),
      close: parseFloat(v.close),
    }))
    .reverse();

  return candles;
}

/** Deteksi swing high/low sederhana: titik i adalah swing jika high/low-nya ekstrem dibanding `lookback` bar di kiri-kanan. */
export function findSwingPoints(candles: Candle[], lookback = 3) {
  const swingHighs: { index: number; price: number; time: string }[] = [];
  const swingLows: { index: number; price: number; time: string }[] = [];

  for (let i = lookback; i < candles.length - lookback; i++) {
    const windowSlice = candles.slice(i - lookback, i + lookback + 1);
    const isHigh = windowSlice.every((c) => c.high <= candles[i].high);
    const isLow = windowSlice.every((c) => c.low >= candles[i].low);
    if (isHigh) swingHighs.push({ index: i, price: candles[i].high, time: candles[i].time });
    if (isLow) swingLows.push({ index: i, price: candles[i].low, time: candles[i].time });
  }

  return { swingHighs, swingLows };
}

/** Ambil jam:menit saat ini di timezone New York (otomatis handle EST/EDT). */
export function nowInNewYork(): { hour: number; minute: number; label: string } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  const label = new Intl.DateTimeFormat("id-ID", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  return { hour, minute, label };
}

export function isWithinSession(hour: number, minute: number, startHour: number, endHour: number) {
  const totalMin = hour * 60 + minute;
  return totalMin >= startHour * 60 && totalMin <= endHour * 60;
}

/** Ambil high/low tertinggi dari candle 1h dalam rentang jam NY tertentu, `daysBack` hari ke belakang. */
export function sessionExtremes(
  candles1h: Candle[],
  startHour: number,
  endHour: number
): { high: number | null; low: number | null } {
  const inRange = candles1h.filter((c) => {
    const d = new Date(c.time + "Z");
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "-1");
    return hour >= startHour && hour <= endHour;
  });

  if (inRange.length === 0) return { high: null, low: null };
  const high = Math.max(...inRange.map((c) => c.high));
  const low = Math.min(...inRange.map((c) => c.low));
  return { high, low };
}
