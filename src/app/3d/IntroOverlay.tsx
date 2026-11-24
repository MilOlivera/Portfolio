"use client";

import { useState } from "react";
import CornerBrackets from "@/components/CornerBrackets";

const EXIT_MS = 400;

const META = [
  { k: "BUQUE", v: "B/T NANY" },
  { k: "PUERTO", v: "CAMPANA (km 97)" },
  { k: "DESTINO", v: "ZONA COMÚN" },
];

/**
 * Briefing shown on every visit to /3d (the scene already renders behind the
 * blur). INICIAR fades the panel out, then hands over to the tutorial.
 */
export default function IntroOverlay({ onStart }: { onStart: () => void }) {
  const [leaving, setLeaving] = useState(false);

  const start = () => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onStart, EXIT_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center bg-bg/40 px-4 transition-opacity duration-400 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <section
        aria-labelledby="intro-title"
        className="relative w-full max-w-xl border border-border-strong bg-bg/70 p-6 font-mono backdrop-blur-md sm:p-8"
      >
        <CornerBrackets size="size-4" />

        <p className="text-[11px] tracking-[0.3em] text-text-mute uppercase">briefing</p>
        <h1 id="intro-title" className="mt-3 text-2xl leading-tight font-bold text-text sm:text-3xl">
          Bienvenidos a mi otra cara
          <span
            aria-hidden
            className="ml-[0.15em] inline-block h-[0.9em] w-[0.45em] translate-y-[0.1em] bg-green animate-blink"
          />
        </h1>
        <h2 className="mt-1 text-lg text-green glow-text sm:text-xl">la de marino mercante</h2>

        <p className="mt-5 font-sans text-sm leading-relaxed text-text-mid sm:text-base">
          Creé esta mini navegación para que se sientan un poco parte de mi profesión, y a su vez, los invito a ver
          los desarrollos que hice hasta la fecha.
        </p>

        <dl className="mt-6 grid grid-cols-3 border-y border-border text-[11px]">
          {META.map((m) => (
            <div key={m.k} className="px-2 py-3 first:pl-0">
              <dt className="tracking-widest text-text-mute">{m.k}</dt>
              <dd className="mt-1 text-text">{m.v}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          autoFocus
          onClick={start}
          className="mt-6 inline-flex cursor-pointer items-center gap-3 border border-green bg-green px-5 py-3 text-sm font-bold tracking-wider text-bg transition-shadow hover:glow-box"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="size-5">
            {/* helm (timón) */}
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="1.6" />
            <path d="M12 2v4.5M12 17.5V22M2 12h4.5M17.5 12H22M4.9 4.9l3.2 3.2M15.9 15.9l3.2 3.2M4.9 19.1l3.2-3.2M15.9 8.1l3.2-3.2" />
          </svg>
          INICIAR NAVEGACIÓN →
        </button>

        <p className="mt-5 text-[11px] tracking-wider text-text-mute">
          La experiencia dura ~5 min · WASD navegar · V cámara libre
        </p>
      </section>
    </div>
  );
}
