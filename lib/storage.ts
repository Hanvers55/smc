export type Rule = {
  id: string;
  label: string;
  group: string;
};

export type JournalEntry = {
  id: string;
  pair: string;
  bias: "Buy" | "Sell" | "Netral";
  score: number; // 0-100
  checked: string[]; // rule ids that were checked (kosong untuk entri AI)
  total: number;
  note: string;
  createdAt: string; // ISO date
  source?: "manual" | "ai";
};

const RULES_KEY = "tc_rules_v1";
const PAIRS_KEY = "tc_pairs_v1";
const JOURNAL_KEY = "tc_journal_v1";

export const DEFAULT_PAIRS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "XAUUSD",
  "GBPJPY",
  "AUDUSD",
  "BTCUSD",
];

export const DEFAULT_RULES: Rule[] = [
  {
    id: "r1",
    label: "External swing points sudah membentuk HH/HL (bias long) atau LH/LL (bias short)",
    group: "1. Directional Bias",
  },
  {
    id: "r2",
    label: "Tidak terkecoh struktur internal di dalam range utama",
    group: "1. Directional Bias",
  },
  {
    id: "r3",
    label: "Waktu masuk di sesi London (02:00–05:00 EST) atau New York (07:00–10:00 EST)",
    group: "2. Time & Price",
  },
  {
    id: "r4",
    label: "Market sudah melikuidasi level kunci (Asia High/Low atau sesi Frankfurt)",
    group: "3. Liquidation",
  },
  {
    id: "r5",
    label: "TF 15 menit menunjukkan tren besar yang jelas",
    group: "4. Reversal Confirmation",
  },
  {
    id: "r6",
    label: "TF 1 menit sudah konfirmasi shift momentum/change of character searah tren 15 menit",
    group: "4. Reversal Confirmation",
  },
  {
    id: "r7",
    label: "Ada Order Block (OB), Fair Value Gap (FVG), atau IFVG di TF 5 menit",
    group: "5. Entry Model",
  },
  {
    id: "r8",
    label: "Area entry adalah titik overlap OB + FVG/IFVG (confluence tertinggi)",
    group: "5. Entry Model",
  },
  {
    id: "r9",
    label: "RR sesuai plan (fokus RR besar, bukan kejar win rate tinggi)",
    group: "Risiko & Psikologi",
  },
  {
    id: "r10",
    label: "Kondisi psikologis tenang — tidak revenge trade / FOMO",
    group: "Risiko & Psikologi",
  },
];

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadRules(): Rule[] {
  if (typeof window === "undefined") return DEFAULT_RULES;
  return safeParse<Rule[]>(localStorage.getItem(RULES_KEY), DEFAULT_RULES);
}

export function saveRules(rules: Rule[]) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function loadPairs(): string[] {
  if (typeof window === "undefined") return DEFAULT_PAIRS;
  return safeParse<string[]>(localStorage.getItem(PAIRS_KEY), DEFAULT_PAIRS);
}

export function savePairs(pairs: string[]) {
  localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
}

export function loadJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<JournalEntry[]>(localStorage.getItem(JOURNAL_KEY), []);
}

export function saveJournal(entries: JournalEntry[]) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
}
