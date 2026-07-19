"use client";

import { useEffect, useMemo, useState } from "react";
import PairPicker from "@/components/PairPicker";
import Checklist from "@/components/Checklist";
import ScoreRing from "@/components/ScoreRing";
import JournalList from "@/components/JournalList";
import TradingViewChart from "@/components/TradingViewChart";
import AutoAnalysis, { AnalysisResult } from "@/components/AutoAnalysis";
import {
  DEFAULT_PAIRS,
  DEFAULT_RULES,
  JournalEntry,
  Rule,
  loadJournal,
  loadPairs,
  loadRules,
  savePairs,
  saveJournal,
  saveRules,
} from "@/lib/storage";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [pairs, setPairs] = useState<string[]>(DEFAULT_PAIRS);
  const [rules, setRules] = useState<Rule[]>(DEFAULT_RULES);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [activePair, setActivePair] = useState(DEFAULT_PAIRS[0]);
  const [bias, setBias] = useState<"Buy" | "Sell">("Buy");
  const [note, setNote] = useState("");
  const [checkedMap, setCheckedMap] = useState<Record<string, Set<string>>>(
    {}
  );
  const [tab, setTab] = useState<"checklist" | "jurnal">("checklist");
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const p = loadPairs();
    const r = loadRules();
    const j = loadJournal();
    setPairs(p);
    setRules(r);
    setJournal(j);
    setActivePair(p[0] ?? DEFAULT_PAIRS[0]);
    setHydrated(true);
  }, []);

  const checked = checkedMap[activePair] ?? new Set<string>();

  useEffect(() => {
    setAiResult(null);
  }, [activePair]);

  function toggleRule(id: string) {
    setCheckedMap((prev) => {
      const current = new Set(prev[activePair] ?? []);
      if (current.has(id)) current.delete(id);
      else current.add(id);
      return { ...prev, [activePair]: current };
    });
  }

  function addPair(pair: string) {
    if (pairs.includes(pair)) {
      setActivePair(pair);
      return;
    }
    const next = [...pairs, pair];
    setPairs(next);
    savePairs(next);
    setActivePair(pair);
  }

  function removePair(pair: string) {
    const next = pairs.filter((p) => p !== pair);
    setPairs(next);
    savePairs(next);
    if (activePair === pair) setActivePair(next[0] ?? "");
  }

  function addRule(label: string, group: string) {
    const next = [...rules, { id: crypto.randomUUID(), label, group }];
    setRules(next);
    saveRules(next);
  }

  function removeRule(id: string) {
    const next = rules.filter((r) => r.id !== id);
    setRules(next);
    saveRules(next);
  }

  const score = useMemo(() => {
    if (rules.length === 0) return 0;
    return Math.round((checked.size / rules.length) * 100);
  }, [checked, rules]);

  function saveToJournal() {
    if (!activePair) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      pair: activePair,
      bias,
      score,
      checked: Array.from(checked),
      total: rules.length,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...journal];
    setJournal(next);
    saveJournal(next);
    setCheckedMap((prev) => ({ ...prev, [activePair]: new Set() }));
    setNote("");
    setTab("jurnal");
  }

  function saveAiToJournal() {
    if (!aiResult || !activePair) return;
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      pair: activePair,
      bias: aiResult.bias,
      score: aiResult.score,
      checked: [],
      total: aiResult.rules.length,
      note: aiResult.summary,
      createdAt: new Date().toISOString(),
      source: "ai",
    };
    const next = [entry, ...journal];
    setJournal(next);
    saveJournal(next);
    setTab("jurnal");
  }

  function deleteJournalEntry(id: string) {
    const next = journal.filter((e) => e.id !== id);
    setJournal(next);
    saveJournal(next);
  }

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink font-mono text-xs text-mist">
        memuat...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-ink text-paper">
      <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-baseline gap-2.5">
          <div className="font-mono text-sm font-semibold tracking-wide">
            TRADE<span className="text-bull">.</span>CHECKLIST
          </div>
          <div className="hidden font-mono text-[11px] text-mist sm:block">
            konfirmasi setup sebelum entry
          </div>
        </div>
        <div className="flex overflow-hidden rounded-md border border-line font-mono text-xs">
          <button
            onClick={() => setTab("checklist")}
            className={`px-3 py-1.5 transition ${
              tab === "checklist"
                ? "bg-panel2 text-paper"
                : "text-mist hover:text-paper"
            }`}
          >
            Checklist
          </button>
          <button
            onClick={() => setTab("jurnal")}
            className={`px-3 py-1.5 transition ${
              tab === "jurnal"
                ? "bg-panel2 text-paper"
                : "text-mist hover:text-paper"
            }`}
          >
            Jurnal ({journal.length})
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-56 shrink-0 border-r border-line bg-panel/40 md:flex">
          <PairPicker
            pairs={pairs}
            activePair={activePair}
            onSelect={setActivePair}
            onAddPair={addPair}
            onRemovePair={removePair}
          />
        </aside>

        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-5 py-6">
            {/* Mobile pair select */}
            <div className="mb-4 md:hidden">
              <select
                value={activePair}
                onChange={(e) => setActivePair(e.target.value)}
                className="w-full rounded-md border border-line bg-panel px-3 py-2 font-mono text-sm text-paper"
              >
                {pairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {tab === "checklist" ? (
              <>
                <div className="mb-4">
                  <TradingViewChart pair={activePair} />
                </div>

                <div className="mb-6">
                  <AutoAnalysis pair={activePair} onResult={setAiResult} />
                  {aiResult && (
                    <button
                      onClick={saveAiToJournal}
                      className="mt-3 w-full rounded-md border border-line bg-panel2/60 py-2 text-sm font-medium text-paper transition hover:bg-panel2"
                    >
                      Simpan hasil AI ke jurnal
                    </button>
                  )}
                </div>

                <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-mist">
                  Checklist manual (opsional)
                </div>

                <div className="mb-6 rounded-lg border border-line bg-panel p-4 shadow-panel">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-lg font-semibold tracking-wide">
                        {activePair || "—"}
                      </div>
                      <div className="mt-1 flex overflow-hidden rounded-md border border-line font-mono text-xs">
                        <button
                          onClick={() => setBias("Buy")}
                          className={`px-3 py-1 transition ${
                            bias === "Buy"
                              ? "bg-bull/15 text-bull"
                              : "text-mist hover:text-paper"
                          }`}
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => setBias("Sell")}
                          className={`px-3 py-1 transition ${
                            bias === "Sell"
                              ? "bg-bear/15 text-bear"
                              : "text-mist hover:text-paper"
                          }`}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                    <ScoreRing score={score} />
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
                  <Checklist
                    rules={rules}
                    checked={checked}
                    onToggle={toggleRule}
                    onAddRule={addRule}
                    onRemoveRule={removeRule}
                  />
                </div>

                <div className="mt-4 rounded-lg border border-line bg-panel p-4 shadow-panel">
                  <div className="mb-2 font-mono text-[11px] uppercase tracking-widest text-mist">
                    Catatan (opsional)
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Alasan entry, target, atau catatan lain..."
                    rows={3}
                    className="w-full resize-none rounded-md border border-line bg-panel2/40 px-3 py-2 text-sm text-paper placeholder:text-mist focus:border-bull focus:outline-none"
                  />
                  <button
                    onClick={saveToJournal}
                    disabled={!activePair}
                    className="mt-3 w-full rounded-md bg-bull py-2.5 text-sm font-medium text-ink transition hover:opacity-90 disabled:opacity-40"
                  >
                    Simpan ke jurnal
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-line bg-panel p-4 shadow-panel">
                <div className="mb-4 font-mono text-[11px] uppercase tracking-widest text-mist">
                  Riwayat Checklist
                </div>
                <JournalList entries={journal} onDelete={deleteJournalEntry} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
