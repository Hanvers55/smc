"use client";

import { useState } from "react";
import ScoreRing from "@/components/ScoreRing";

export type AnalysisResult = {
  bias: "Buy" | "Sell" | "Netral";
  score: number;
  rules: { group: string; met: boolean; note: string }[];
  summary: string;
  entryIdea: string;
  meta?: { nyTime: string; lastPrice: number };
};

export default function AutoAnalysis({
  pair,
  onResult,
}: {
  pair: string;
  onResult: (result: AnalysisResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze?pair=${encodeURIComponent(pair)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analisa gagal");
      setResult(data);
      onResult(data);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-widest text-mist">
          Analisa Otomatis (AI)
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading || !pair}
          className="rounded-md bg-bull px-3 py-1.5 text-xs font-medium text-ink transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "Menganalisa..." : "Jalankan Analisa"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-bear/40 bg-bear/10 px-3 py-2 text-xs text-bear">
          {error}
        </div>
      )}

      {!error && !result && !loading && (
        <div className="rounded-md border border-dashed border-line px-4 py-6 text-center font-mono text-xs text-mist">
          Klik "Jalankan Analisa" untuk mengambil harga live dan minta AI
          mengevaluasi 5 rule SMC untuk {pair || "pair ini"}.
        </div>
      )}

      {loading && (
        <div className="rounded-md border border-dashed border-line px-4 py-6 text-center font-mono text-xs text-mist">
          Mengambil data harga & menjalankan analisa...
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] text-mist">Bias AI</div>
              <div
                className={`font-mono text-lg font-semibold ${
                  result.bias === "Buy"
                    ? "text-bull"
                    : result.bias === "Sell"
                    ? "text-bear"
                    : "text-signal"
                }`}
              >
                {result.bias}
              </div>
            </div>
            <ScoreRing score={result.score} />
          </div>

          <div className="space-y-1.5">
            {result.rules.map((r) => (
              <div
                key={r.group}
                className={`rounded-md border px-3 py-2 text-sm ${
                  r.met
                    ? "border-bull/40 bg-bull/[0.06] text-paper"
                    : "border-line bg-panel2/40 text-paper/80"
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span>{r.met ? "✅" : "⬜"}</span>
                  <span className="uppercase tracking-wide text-mist">
                    {r.group}
                  </span>
                </div>
                <div className="mt-1 text-sm">{r.note}</div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-line bg-panel2/40 p-3">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-mist">
              Ringkasan
            </div>
            <p className="text-sm text-paper/90">{result.summary}</p>
          </div>

          <div className="rounded-md border border-signal/30 bg-signal/[0.06] p-3">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-signal">
              Ide Entry
            </div>
            <p className="text-sm text-paper/90">{result.entryIdea}</p>
          </div>

          {result.meta && (
            <div className="font-mono text-[11px] text-mist">
              Harga terakhir {result.meta.lastPrice} · waktu NY {result.meta.nyTime}
            </div>
          )}

          <p className="font-mono text-[10px] leading-relaxed text-mist">
            Analisa dihasilkan otomatis oleh AI berdasarkan data harga live, bukan
            nasihat keuangan. Tetap lakukan konfirmasi sendiri dan kelola risiko
            sesuai rencana trading kamu.
          </p>
        </div>
      )}
    </div>
  );
}
