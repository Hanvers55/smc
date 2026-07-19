"use client";

import { useMemo, useState } from "react";
import { Rule } from "@/lib/storage";

type Props = {
  rules: Rule[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  onAddRule: (label: string, group: string) => void;
  onRemoveRule: (id: string) => void;
};

export default function Checklist({
  rules,
  checked,
  onToggle,
  onAddRule,
  onRemoveRule,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, Rule[]>();
    for (const r of rules) {
      const key = r.group || "Lainnya";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [rules]);

  function submitRule() {
    const l = label.trim();
    if (!l) return;
    onAddRule(l, group.trim() || "Lainnya");
    setLabel("");
    setGroup("");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-widest text-mist">
          Rule Checklist
        </div>
        <button
          onClick={() => setEditing((v) => !v)}
          className="font-mono text-xs text-mist transition hover:text-paper"
        >
          {editing ? "Selesai edit" : "Kelola rule"}
        </button>
      </div>

      <div className="space-y-5">
        {grouped.map(([groupName, items]) => (
          <div key={groupName}>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-mist/70">
              {groupName}
            </div>
            <div className="space-y-1.5">
              {items.map((rule) => {
                const isChecked = checked.has(rule.id);
                return (
                  <label
                    key={rule.id}
                    className={`group flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 transition ${
                      isChecked
                        ? "border-bull/40 bg-bull/[0.06]"
                        : "border-line bg-panel2/40 hover:border-line/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggle(rule.id)}
                        className="h-4 w-4 shrink-0 accent-bull"
                      />
                      <span
                        className={`text-sm ${
                          isChecked ? "text-paper" : "text-paper/85"
                        }`}
                      >
                        {rule.label}
                      </span>
                    </div>
                    {editing && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onRemoveRule(rule.id);
                        }}
                        className="ml-3 text-xs text-mist hover:text-bear"
                        title="Hapus rule"
                      >
                        ✕
                      </button>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="rounded-md border border-dashed border-line px-4 py-6 text-center font-mono text-xs text-mist">
            Belum ada rule. Tambahkan rule trading kamu di bawah.
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-5 rounded-md border border-line bg-panel2/50 p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-mist">
            Tambah rule baru
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Isi rule, cth. RSI belum overbought"
              className="flex-1 rounded-md border border-line bg-panel px-3 py-2 text-sm text-paper placeholder:text-mist focus:border-bull focus:outline-none"
            />
            <input
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              placeholder="Kategori (opsional)"
              className="w-full rounded-md border border-line bg-panel px-3 py-2 text-sm text-paper placeholder:text-mist focus:border-bull focus:outline-none sm:w-40"
            />
            <button
              onClick={submitRule}
              className="rounded-md bg-bull px-4 py-2 text-sm font-medium text-ink transition hover:opacity-90"
            >
              Tambah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
