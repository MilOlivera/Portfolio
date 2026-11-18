"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { WELCOME, runCommand, type Line, type Style } from "@/lib/commands";

type Entry =
  | { id: number; kind: "input"; text: string }
  | { id: number; kind: "output"; lines: Line[] };

const PROMPT = "milton@portfolio:~$";

const STYLE_CLASS: Record<Style, string> = {
  k: "text-green",
  d: "text-text-mute",
  w: "text-warn",
  p: "text-phosphor",
};

function OutputLine({ line }: { line: Line }) {
  // Empty line keeps its height
  if (line.every((s) => s.text === "")) return <div aria-hidden>&nbsp;</div>;
  return (
    <div>
      {line.map((seg, i) => {
        const cls = seg.style ? STYLE_CLASS[seg.style] : "text-text";
        return seg.href ? (
          <a
            key={i}
            href={seg.href}
            target={seg.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`${cls} underline decoration-dotted underline-offset-4 hover:glow-text`}
          >
            {seg.text}
          </a>
        ) : (
          <span key={i} className={cls}>
            {seg.text}
          </span>
        );
      })}
    </div>
  );
}

export default function TerminalSection() {
  const { theme, setTheme } = useTheme();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, kind: "output", lines: WELCOME }]);
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  // Position while browsing history with ↑↓; null = editing a fresh line
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the terminal (not the page) scrolled to the latest output
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  function submit() {
    const raw = input;
    const trimmed = raw.trim();
    setInput("");
    setHistoryIndex(null);

    const echo: Entry = { id: nextId.current++, kind: "input", text: raw };
    if (!trimmed) {
      setEntries((prev) => [...prev, echo]);
      return;
    }

    const newHistory = [...history, trimmed];
    setHistory(newHistory);

    const result = runCommand(trimmed, { theme, history: newHistory });
    if (result.type === "CLEAR") {
      setEntries([]);
      return;
    }
    if (result.setTheme) setTheme(result.setTheme);
    setEntries((prev) => [...prev, echo, { id: nextId.current++, kind: "output", lines: result.lines }]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      e.preventDefault();
      const idx = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      if (historyIndex === null) return;
      e.preventDefault();
      const idx = historyIndex + 1;
      if (idx >= history.length) {
        setHistoryIndex(null);
        setInput("");
      } else {
        setHistoryIndex(idx);
        setInput(history[idx]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setEntries([]);
    }
  }

  // Click anywhere in the window focuses the input, unless selecting text
  function focusInput() {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  }

  return (
    <section id="terminal" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <div
        className="overflow-hidden rounded-sm border border-border-strong shadow-[0_0_40px_-12px_var(--green-glow)]"
        onClick={focusInput}
      >
        {/* Title bar */}
        <div className="relative flex h-9 items-center border-b border-border-strong bg-surface px-3">
          <div className="flex gap-2" aria-hidden>
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="absolute inset-x-0 text-center font-mono text-xs text-text-mute">
            milton@portfolio:~/about
          </p>
        </div>

        {/* Output */}
        <div
          ref={bodyRef}
          className="terminal-scroll max-h-[400px] min-h-[320px] overflow-y-auto bg-black px-4 pt-4 pb-2 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words"
          role="log"
          aria-live="polite"
          aria-label="Salida de la terminal"
        >
          {entries.map((entry) =>
            entry.kind === "input" ? (
              <div key={entry.id}>
                <span className="text-green">{PROMPT} </span>
                <span className="text-text">{entry.text}</span>
              </div>
            ) : (
              <div key={entry.id} className="mb-2">
                {entry.lines.map((line, i) => (
                  <OutputLine key={i} line={line} />
                ))}
              </div>
            ),
          )}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 border-t border-border bg-black px-4 py-3 font-mono text-[13px]">
          <label htmlFor="terminal-input" className="shrink-0 text-green">
            {PROMPT}
          </label>
          <input
            ref={inputRef}
            id="terminal-input"
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setHistoryIndex(null);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder="type 'help'"
            className="min-w-0 flex-1 border-none bg-transparent text-text caret-green outline-none placeholder:text-text-dim"
          />
        </div>
      </div>
    </section>
  );
}
