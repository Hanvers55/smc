import { NextRequest, NextResponse } from "next/server";
import {
  fetchCandles,
  findSwingPoints,
  isWithinSession,
  nowInNewYork,
  sessionExtremes,
  toTwelveDataSymbol,
} from "@/lib/market";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pair = req.nextUrl.searchParams.get("pair");
  if (!pair) {
    return NextResponse.json({ error: "Parameter pair wajib diisi" }, { status: 400 });
  }

  const twelveKey = process.env.TWELVEDATA_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!twelveKey || !geminiKey) {
    return NextResponse.json(
      {
        error:
          "Server belum diset. Tambahkan GEMINI_API_KEY dan TWELVEDATA_API_KEY di Environment Variables Vercel, lalu redeploy.",
      },
      { status: 500 }
    );
  }

  try {
    const symbol = toTwelveDataSymbol(pair);

    const [c1h, c15m, c5m, c1m] = await Promise.all([
      fetchCandles(symbol, "1h", 48, twelveKey),
      fetchCandles(symbol, "15min", 80, twelveKey),
      fetchCandles(symbol, "5min", 60, twelveKey),
      fetchCandles(symbol, "1min", 60, twelveKey),
    ]);

    const { hour, minute, label } = nowInNewYork();
    const inLondon = isWithinSession(hour, minute, 2, 5);
    const inNewYork = isWithinSession(hour, minute, 7, 10);

    const asia = sessionExtremes(c1h, 20, 23);
    const frankfurt = sessionExtremes(c1h, 2, 3);

    const { swingHighs, swingLows } = findSwingPoints(c15m, 3);
    const last2Highs = swingHighs.slice(-2).map((s) => s.price);
    const last2Lows = swingLows.slice(-2).map((s) => s.price);

    const lastPrice = c1m[c1m.length - 1]?.close ?? c5m[c5m.length - 1]?.close;

    const recent15m = c15m.slice(-10);
    const recentHigh = Math.max(...recent15m.map((c) => c.high));
    const recentLow = Math.min(...recent15m.map((c) => c.low));

    const dataSummary = `
PAIR: ${pair}
Waktu sekarang (New York): ${label} (jam ${hour}:${String(minute).padStart(2, "0")})
Dalam jendela sesi London (02:00-05:00 NY)? ${inLondon ? "YA" : "TIDAK"}
Dalam jendela sesi New York (07:00-10:00 NY)? ${inNewYork ? "YA" : "TIDAK"}

Harga terakhir: ${lastPrice}

Swing highs terakhir (TF 15m, dari lama ke baru): ${last2Highs.join(", ") || "belum cukup data"}
Swing lows terakhir (TF 15m, dari lama ke baru): ${last2Lows.join(", ") || "belum cukup data"}

Perkiraan range sesi Asia (jam 20:00-23:00 NY, beberapa hari terakhir): high=${asia.high ?? "n/a"} low=${asia.low ?? "n/a"}
Perkiraan range sesi Frankfurt (jam 02:00-03:00 NY, beberapa hari terakhir): high=${frankfurt.high ?? "n/a"} low=${frankfurt.low ?? "n/a"}
High/low 10 candle 15m terakhir: high=${recentHigh} low=${recentLow}

Candle 5m terakhir (10 terbaru, oldest->newest): ${JSON.stringify(
      c5m.slice(-10).map((c) => ({ o: c.open, h: c.high, l: c.low, c: c.close }))
    )}
Candle 1m terakhir (10 terbaru, oldest->newest): ${JSON.stringify(
      c1m.slice(-10).map((c) => ({ o: c.open, h: c.high, l: c.low, c: c.close }))
    )}
`.trim();

    const systemPrompt = `Kamu adalah asisten analisa trading yang menerapkan strategi Smart Money Concepts (SMC) sistematis dengan 5 aturan berikut:
1. Directional Bias: tentukan bias dari external swing points TF 15m (higher high/higher low = bias long, lower high/lower low = bias short). Abaikan struktur internal minor.
2. Time & Price: hanya valid entry jika waktu sekarang (New York) masuk sesi London (02:00-05:00) atau New York (07:00-10:00).
3. Liquidation: sebelum entry, harga harus sudah melikuidasi (menembus) level Asia session high/low atau Frankfurt session high/low.
4. Reversal Confirmation: TF 15m menentukan tren besar, TF 1m harus menunjukkan shift momentum/change of character searah tren besar itu.
5. Entry Model: cari confluence Order Block / Fair Value Gap / Inverted FVG di TF 5m untuk area entry probabilitas tinggi (dari data candle yang diberikan, taksir secara kasar apakah ada gap/imbalance yang relevan).

Kamu akan menerima ringkasan data harga live. Evaluasi kelima rule itu berdasarkan data yang ada (boleh melakukan estimasi wajar bila data terbatas, tapi sebutkan itu estimasi). Balas HANYA dalam format JSON valid, tanpa markdown, tanpa teks lain, dengan struktur persis:
{
  "bias": "Buy" | "Sell" | "Netral",
  "score": <angka 0-100, persentase rule yang terpenuhi>,
  "rules": [
    {"group": "1. Directional Bias", "met": true|false, "note": "<alasan singkat 1 kalimat, bahasa Indonesia>"},
    {"group": "2. Time & Price", "met": true|false, "note": "..."},
    {"group": "3. Liquidation", "met": true|false, "note": "..."},
    {"group": "4. Reversal Confirmation", "met": true|false, "note": "..."},
    {"group": "5. Entry Model", "met": true|false, "note": "..."}
  ],
  "summary": "<ringkasan analisa 2-3 kalimat, bahasa Indonesia>",
  "entryIdea": "<ide area entry & catatan risk/reward singkat, bahasa Indonesia, atau 'Belum ada setup valid' kalau rule belum terpenuhi>"
}`;

    const aiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: dataSummary }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`Gemini API error: ${errText}`);
    }

    const aiData = await aiRes.json();
    const rawText: string =
      aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: coba ambil substring dari "{" pertama sampai "}" terakhir,
      // jaga-jaga kalau model menambahkan teks lain di luar JSON.
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          parsed = JSON.parse(cleaned.slice(start, end + 1));
        } catch {
          // masih gagal, lempar error dengan potongan raw text untuk debugging
        }
      }
      if (!parsed) {
        throw new Error(
          `Gagal membaca hasil analisa AI (format tidak sesuai). Raw: ${cleaned.slice(0, 300)}`
        );
      }
    }

    return NextResponse.json({
      ...parsed,
      meta: {
        nyTime: label,
        lastPrice,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal menjalankan analisa" },
      { status: 500 }
    );
  }
}
