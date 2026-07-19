"use client";

import { useState } from "react";

type Props = {
  pairs: string[];
  activePair: string;
  onSelect: (pair: string) => void;
  onAddPair: (pair: string) => void;
  onRemovePair: (pair: string) => void;
};

export default function PairPicker({
  pairs,
  activePair,
  onSelect,
  onAddPair,
  onRemovePair,
}: Props) {
  const [draft, setDraft] = useState("");

  function submitCustom() {
    const clean = draft.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!clean) return;
    onAddPair(clean);
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pb-3 pt-4">
        <div className="font-mono text-[11px] uppercase tracking-widest text-mist">
          Watchlist Pair
        </div>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-2">
        {pairs.map((p) => {
          const isActive = p === activePair;
          return (
            <div
              key={p}
              className={`group mb-1 flex items-center justify-between rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-panel2 text-paper shadow-panel"
                  : "text-mist hover:bg-panel2/60 hover:text-paper"
              }`}
            >
              <button
                onClick={() => onSelect(p)}
                className="flex flex-1 items-center gap-2 text-left font-mono text-sm tracking-wide"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isActive ? "bg-bull" : "bg-line"
                  }`}
                />
                {p}
              </button>
              <button
                onClick={() => onRemovePair(p)}
                className="ml-2 hidden text-xs text-mist hover:text-bear group-hover:block"
                aria-label={`Hapus ${p}`}
                title="Hapus pair"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitCustom()}
            placeholder="Pair custom, cth. USDCHF"
            className="w-full rounded-md border border-line bg-panel px-3 py-2 font-mono text-xs uppercase tracking-wide text-paper placeholder:text-mist focus:border-bull focus:outline-none"
          />
          <button
            onClick={submitCustom}
            className="rounded-md bg-panel2 px-3 py-2 font-mono text-xs text-paper transition hover:bg-line"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
