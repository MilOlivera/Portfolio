"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CornerBrackets from "@/components/CornerBrackets";
import { PROJECT_MEDIA, type SlidePlaceholder } from "./project-media";

const SLIDE_MS = 3500;
export const HOLD_MS = 20000; // the boat holds 2 kn this long, then resumes
const TICK_MS = 100;

// Placeholder gradients until real screenshots exist. green/amber come from
// the theme tokens; purple/blue have no token, so they're literal here.
const PLACEHOLDER_BG: Record<SlidePlaceholder, string> = {
  green: "linear-gradient(135deg, color-mix(in srgb, var(--green) 38%, transparent), transparent 70%)",
  amber: "linear-gradient(135deg, color-mix(in srgb, var(--warn) 38%, transparent), transparent 70%)",
  purple: "linear-gradient(135deg, rgba(150, 110, 230, 0.38), transparent 70%)",
  blue: "linear-gradient(135deg, rgba(80, 150, 230, 0.38), transparent 70%)",
};

interface Props {
  projectId: string; // key in PROJECT_MEDIA, e.g. "mi-plata"
  waypointKm: number;
  waypointName: string; // e.g. "Baliza Especial Amarilla"
  onSeguir: () => void; // closes the panel + cancels the auto-slow
  onVerProyecto?: () => void; // undefined → shows SOLICITAR DEMO
  onSolicitarDemo?: () => void;
}

/**
 * Bottom-center panel shown when the boat comes abeam of a project buoy (or
 * close to a Zona Común ship): auto-playing slides, a 20 s countdown after
 * which the boat resumes course, and the project CTAs.
 */
export default function AlTravesCarousel({
  projectId,
  waypointKm,
  waypointName,
  onSeguir,
  onVerProyecto,
  onSolicitarDemo,
}: Props) {
  const media = PROJECT_MEDIA[projectId];
  const slides = media?.slides ?? [];
  const [index, setIndex] = useState(0);
  const [silenced, setSilenced] = useState(false);
  const [remaining, setRemaining] = useState(HOLD_MS);
  const [shown, setShown] = useState(false);
  const deadline = useRef(0);
  const done = useRef(onSeguir);
  useEffect(() => {
    done.current = onSeguir;
  });

  // Enter animation (mount hidden, then fade/slide in)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 20 s countdown → resume course
  useEffect(() => {
    deadline.current = performance.now() + HOLD_MS;
    const id = window.setInterval(() => {
      const left = Math.max(0, deadline.current - performance.now());
      setRemaining(left);
      if (left === 0) {
        window.clearInterval(id);
        done.current();
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [projectId]);

  // Slide auto-play (SILENCIAR pauses it)
  useEffect(() => {
    if (silenced || slides.length < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(id);
  }, [silenced, slides.length]);

  // Esc = SEGUIR
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && done.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!media) return null;
  const seconds = Math.ceil(remaining / 1000);
  const progress = 1 - remaining / HOLD_MS;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-[3%]">
      <section
        aria-labelledby="altraves-name"
        className={`pointer-events-auto relative w-[94%] max-w-[780px] border border-border-strong bg-bg/90 backdrop-blur-[10px] transition-all duration-500 sm:w-full ${
          shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <CornerBrackets size="size-3" />

        {/* Head */}
        <header className="flex items-center gap-3 border-b border-border px-4 py-2.5 font-mono">
          <span className="flex items-center gap-1.5 rounded border border-warn/70 px-2 py-0.5 text-[10px] font-bold tracking-widest text-warn">
            <span className="inline-block size-1.5 rounded-full bg-warn animate-pulse-dot" aria-hidden />
            AL TRAVÉS
          </span>
          <p className="min-w-0 flex-1 truncate text-xs tracking-wider text-text-mid uppercase">
            km {waypointKm} · {waypointName}
          </p>
          <button
            type="button"
            onClick={onSeguir}
            aria-label="Cerrar y seguir navegando"
            className="cursor-pointer px-1 text-text-mute transition-colors hover:text-green"
          >
            ✕
          </button>
        </header>

        {/* Body */}
        <div className="px-4 pt-3 pb-2">
          <h2 id="altraves-name" className="font-mono text-[18px] font-bold text-green">
            {media.name}
          </h2>
          <p className="mt-0.5 font-sans text-[13px] text-text-mute">{media.subtitle}</p>

          <div className="relative mt-3 aspect-[16/7] overflow-hidden border border-border bg-surface">
            {slides.map((s, i) => (
              <div
                key={s.title}
                aria-hidden={i !== index}
                className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
                style={s.imagePath ? undefined : { backgroundImage: PLACEHOLDER_BG[s.placeholder ?? "green"] }}
              >
                {s.imagePath && (
                  <>
                    <Image src={s.imagePath} alt={s.title} fill sizes="780px" className="object-cover object-top" />
                    {/* Amber tint on a white backing, dark text: the screenshots are light */}
                    <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-[2px] border border-[#ffb545] bg-white bg-[linear-gradient(rgba(255,181,69,0.15),rgba(255,181,69,0.15))] px-[7px] py-[3px] font-mono text-[9px] font-bold tracking-[1.5px] text-[#7a4a00]">
                      DATA MOCK
                    </span>
                  </>
                )}
                <span className="absolute bottom-2 left-3 bg-black/55 px-2 py-0.5 font-mono text-[11px] tracking-widest text-text">
                  {s.title}
                </span>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-2 flex justify-center gap-1.5" role="tablist" aria-label="Capturas">
            {slides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={s.title}
                onClick={() => setIndex(i)}
                className={`size-1.5 cursor-pointer rounded-full transition-colors ${i === index ? "bg-green" : "bg-border-strong"}`}
              />
            ))}
          </div>

          {/* Countdown */}
          <div className="mt-3 h-0.5 w-full bg-border" aria-hidden>
            <div className="h-full bg-green" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mt-1.5 font-mono text-[11px] tracking-wider text-text-mute">
            ▸ el barco reanuda rumbo en <span className="text-text tabular-nums">{seconds}s</span> · o tocá SEGUIR
          </p>
        </div>

        {/* Footer CTAs */}
        <footer className="flex flex-wrap gap-2 border-t border-border px-4 py-3 font-mono text-xs font-bold tracking-wider">
          <button
            type="button"
            onClick={() => setSilenced((v) => !v)}
            aria-pressed={silenced}
            className="cursor-pointer border border-transparent px-3 py-2 text-text-mute transition-colors hover:text-text"
          >
            {silenced ? "REANUDAR CARDS" : "SILENCIAR CARDS"}
          </button>
          {onVerProyecto ? (
            <button
              type="button"
              onClick={onVerProyecto}
              className="cursor-pointer border border-border-strong px-3 py-2 text-text transition-colors hover:border-green hover:text-green"
            >
              VER PROYECTO ↗
            </button>
          ) : (
            <button
              type="button"
              onClick={onSolicitarDemo}
              className="cursor-pointer border border-border-strong px-3 py-2 text-text transition-colors hover:border-green hover:text-green"
            >
              SOLICITAR DEMO ✉
            </button>
          )}
          <button
            type="button"
            onClick={onSeguir}
            className="flex-1 cursor-pointer border border-green bg-green px-3 py-2 text-bg transition-shadow hover:glow-box"
          >
            SEGUIR NAVEGANDO →
          </button>
        </footer>
      </section>
    </div>
  );
}
