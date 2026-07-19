"use client";

import { JournalEntry, TradeResult } from "@/lib/storage";

function WinRateStats({ entries }: { entries: JournalEntry[] }) {
  const graded = entries.filter((e) => e.result);
  if (graded.length === 0) return null;

  const wins = graded.filter((e) => e.result === "win").length;
  const losses = graded.filter((e) => e.result === "loss").length;
  const be = graded.filter((e) => e.result === "be").length;
  const winRate = Math.round((wins / graded.length) * 100);

  // breakdown per rule group: dari entry manual, seberapa sering tiap rule
  // "met" muncul di trade yang berujung win vs loss.
  const bySource = {
    ai: graded.filter((e) => e.source === "ai").length,
    manual: graded.filter((e) => e.source !== "ai").length,
  };

  return (
    <div className="mb-4 rounded-md border border-line bg-panel2/40 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-widest text-mist">
          Win Rate ({graded.length} trade dinilai)
        </div>
        <div className="font-mono text-lg font-semibold tabular-nums text-paper">
          {winRate}%
        </div>
      </div>
      <div className="flex gap-2 font-mono text-[11px]">
        <div className="flex-1 rounded border border-line bg-panel px-2 py-1.5 text-center">
          <div className="font-semibold text-bull">{wins}</div>
          <div className="text-mist">Win</div>
        </div>
        <div className="flex-1 rounded border border-line bg-panel px-2 py-1.5 text-center">
          <div className="font-semibold text-bear">{losses}</div>
          <div className="text-mist">Loss</div>
        </div>
        <div className="flex-1 rounded border border-line bg-panel px-2 py-1.5 text-center">
          <div className="font-semibold text-signal">{be}</div>
          <div className="text-mist">BE</div>
        </div>
      </div>
      {bySource.ai > 0 && bySource.manual > 0 && (
        <div className="mt-2 font-mono text-[10px] text-mist">
          Dari {bySource.ai} entri AI dan {bySource.manual} entri manual.
        </div>
      )}
    </div>
  );
}

const RESULT_LABEL: Record<TradeResult, string> = {
  win: "Win",
  loss: "Loss",
  be: "BE",
};

export default function JournalList({
  entries,
  onDelete,
  onSetResult,
}: {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  onSetResult?: (id: string, result: TradeResult | null) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line px-4 py-6 text-center font-mono text-xs text-mist">
        Belum ada riwayat tersimpan.
      </div>
    );
  }

  return (
    <div>
      <WinRateStats entries={entries} />
      <div className="space-y-2">
        {entries.map((e) => {
          const color =
            e.score >= 80 ? "#33D6A0" : e.score >= 50 ? "#F2B84B" : "#FF6B5E";
          return (
            <div
              key={e.id}
              className="rounded-md border border-line bg-panel2/40 px-3 py-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono text-sm font-semibold tabular-nums"
                    style={{ color }}
                  >
                    {e.score}
                  </span>
                  <div>
                    <div className="font-mono text-sm text-paper">
                      {e.pair}{" "}
                      <span
                        className={
                          e.bias === "Buy"
                            ? "text-bull"
                            : e.bias === "Sell"
                            ? "text-bear"
                            : "text-signal"
                        }
                      >
                        {e.bias}
                      </span>{" "}
                      {e.source === "ai" && (
                        <span className="rounded bg-panel2 px-1.5 py-0.5 text-[10px] text-mist">
                          AI
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-mist">
                      {new Date(e.createdAt).toLocaleString("id-ID")}
                      {e.source !== "ai" &&
                        ` · ${e.checked.length}/${e.total} rule`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(e.id)}
                  className="text-xs text-mist hover:text-bear"
                  title="Hapus catatan"
                >
                  ✕
                </button>
              </div>

              {onSetResult && (
                <div className="mt-2.5 flex items-center gap-1.5 border-t border-line pt-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-mist">
                    Hasil:
                  </span>
                  {(["win", "loss", "be"] as TradeResult[]).map((r) => {
                    const active = e.result === r;
                    const activeColor =
                      r === "win"
                        ? "bg-bull/15 text-bull border-bull/40"
                        : r === "loss"
                        ? "bg-bear/15 text-bear border-bear/40"
                        : "bg-signal/15 text-signal border-signal/40";
                    return (
                      <button
                        key={r}
                        onClick={() => onSetResult(e.id, active ? null : r)}
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] transition ${
                          active
                            ? activeColor
                            : "border-line text-mist hover:text-paper"
                        }`}
                      >
                        {RESULT_LABEL[r]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
