"use client";

import { JournalEntry } from "@/lib/storage";

export default function JournalList({
  entries,
  onDelete,
}: {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-line px-4 py-6 text-center font-mono text-xs text-mist">
        Belum ada riwayat tersimpan.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const color =
          e.score >= 80 ? "#33D6A0" : e.score >= 50 ? "#F2B84B" : "#FF6B5E";
        return (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-md border border-line bg-panel2/40 px-3 py-2.5"
          >
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
                  {e.source !== "ai" && ` · ${e.checked.length}/${e.total} rule`}
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
        );
      })}
    </div>
  );
}
