"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BOOT_STORAGE_KEY } from "@/lib/theme";

type Phase = "boot" | "exit" | "done";

const BOOT_MS = 2000;
const EXIT_MS = 350;

const LINES: { text: string; status?: "ok" | "warn" }[] = [
  { text: "MILTON_OS v16.4 — kernel 2026.11 (x86_64)" },
  { text: "checking memory ......... 12 projects loaded", status: "ok" },
  { text: "mounting /dev/fullstack", status: "ok" },
  { text: "mounting /dev/marina-mercante", status: "ok" },
  { text: "linking evolvere.core", status: "ok" },
  { text: "7 modules classified — access restricted", status: "warn" },
  { text: "starting interface ..." },
];

export default function BootSequence() {
  // Always "boot" on the server and on the first client render so hydration
  // matches. If the boot was already seen this session, the inline script has
  // set html[data-booted] and CSS keeps the overlay hidden until we unmount.
  const [phase, setPhase] = useState<Phase>("boot");
  const [visibleLines, setVisibleLines] = useState(0);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const finish = useCallback(() => {
    clearTimers();
    setVisibleLines(LINES.length);
    setPhase((p) => (p === "boot" ? "exit" : p));
    timers.current.push(window.setTimeout(() => setPhase("done"), EXIT_MS));
  }, []);

  // Read once per mount: StrictMode re-runs effects in dev, and by then
  // we've already written the key.
  const alreadySeen = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    if (alreadySeen.current === null) {
      try {
        alreadySeen.current = sessionStorage.getItem(BOOT_STORAGE_KEY) !== null;
        sessionStorage.setItem(BOOT_STORAGE_KEY, "1");
      } catch {
        // No storage: show the boot every load, it's skippable anyway.
        alreadySeen.current = false;
      }
    }
    if (alreadySeen.current) {
      setPhase("done");
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisibleLines(LINES.length);
    } else {
      const step = (BOOT_MS - 300) / LINES.length;
      LINES.forEach((_, i) => {
        timers.current.push(window.setTimeout(() => setVisibleLines(i + 1), 120 + step * i));
      });
    }
    timers.current.push(window.setTimeout(finish, BOOT_MS));

    return clearTimers;
  }, [finish]);

  // Skip on any key, click or touch
  useEffect(() => {
    if (phase !== "boot") return;
    const skip = () => finish();
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase, finish]);

  if (phase === "done") return null;

  const progress = Math.round((visibleLines / LINES.length) * 100);

  return (
    <div
      className={`boot-overlay fixed inset-0 z-50 flex items-center justify-center bg-bg px-4 transition-opacity ease-out ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${EXIT_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-label="Iniciando portfolio"
    >
      <div className="w-full max-w-xl font-mono text-xs leading-relaxed sm:text-sm">
        <div className="mb-4 flex items-center gap-2 text-text-mute">
          <span className="inline-block size-2 rounded-full bg-green animate-pulse-dot" />
          <span>boot://milton-olivera</span>
        </div>

        <ul className="space-y-1">
          {LINES.slice(0, visibleLines).map((line) => (
            <li key={line.text} className="flex gap-3">
              <span
                className={`shrink-0 ${
                  line.status === "warn"
                    ? "text-warn"
                    : line.status === "ok"
                      ? "text-green"
                      : "text-text-dim"
                }`}
              >
                {line.status === "warn" ? "[WARN]" : line.status === "ok" ? "[ OK ]" : "[ .. ]"}
              </span>
              <span className="text-text">{line.text}</span>
            </li>
          ))}
          <li aria-hidden className="text-green">
            <span className="animate-blink">█</span>
          </li>
        </ul>

        <div className="mt-6">
          <div className="h-px w-full bg-border">
            <div
              className="h-px bg-green glow-box transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-text-dim sm:text-xs">
            <span>{progress}%</span>
            <span>presioná cualquier tecla para saltar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
