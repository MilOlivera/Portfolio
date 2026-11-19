"use client";

import { useEffect, useState } from "react";
import { UNMOOR_EVENT, headingToDegrees, useBoatTelemetry } from "./BoatTelemetry";

// AMARRADO (button) → CAIDA (engine ahead + rudder to fall off downstream)
// → NAVEGANDO (overlay gone for good).
type Phase = "AMARRADO" | "CAIDA" | "NAVEGANDO";

const POLL_MS = 100;
const TARGET_HEADING = 210; // °, south-west: downstream
const WINDOW_MIN = 180;
const WINDOW_MAX = 240;
const UNDERWAY_SPEED = 3; // units/s

export default function TutorialOverlay() {
  const telemetry = useBoatTelemetry();
  const [phase, setPhase] = useState<Phase>("AMARRADO");
  const [heading, setHeading] = useState(0);

  // During the caída: track heading and finish once under way on course
  useEffect(() => {
    if (phase !== "CAIDA") return;
    const id = window.setInterval(() => {
      const t = telemetry.current;
      const deg = headingToDegrees(t.heading);
      setHeading(deg);
      if (t.velocity > UNDERWAY_SPEED && deg >= WINDOW_MIN && deg <= WINDOW_MAX) setPhase("NAVEGANDO");
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [phase, telemetry]);

  const unmoor = () => {
    window.dispatchEvent(new CustomEvent(UNMOOR_EVENT));
    setHeading(headingToDegrees(telemetry.current.heading));
    setPhase("CAIDA");
  };

  if (phase === "AMARRADO") {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-4">
        <div className="pointer-events-auto w-full max-w-md border border-green bg-bg/70 p-6 text-center font-mono backdrop-blur">
          <p className="text-sm font-bold tracking-wider text-green">◉ B/T NANY · AMARRADO</p>
          <p className="mt-1 text-xs tracking-wider text-text-mid">TERMINAL AXION PAE · KM 96.5 CAMPANA</p>
          <p className="mt-1 text-xs tracking-wider text-text-mid">▲ CARGA IFO 380 COMPLETADA ✓</p>
          <button
            type="button"
            autoFocus
            onClick={unmoor}
            className="mt-6 cursor-pointer rounded border-2 border-green bg-bg/90 px-8 py-4 font-mono text-lg font-bold text-green transition-colors hover:bg-green hover:text-bg"
          >
            DESAMARRAR BUQUE ◉
          </button>
        </div>
      </div>
    );
  }

  const done = phase === "NAVEGANDO";
  const pct = (deg: number) => `${(deg / 360) * 100}%`;
  const onCourse = heading >= WINDOW_MIN && heading <= WINDOW_MAX;

  return (
    <div
      aria-hidden={done}
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4 transition-opacity duration-500 ${
        done ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-lg border border-green bg-bg/70 p-4 font-mono backdrop-blur">
        <p className="text-sm font-bold tracking-wider text-green">◉ MANIOBRA DE CAÍDA</p>
        <p className="mt-1 font-sans text-sm text-text-mid">
          Dale máquina avante [W] y usá el timón [A]/[D] para caer al sur-oeste
        </p>
        <p className="mt-1 text-xs text-warn">▸ El muelle está a babor: caé a estribor [D]</p>
        <p role="status" className="mt-2 text-xs tracking-wider text-text-mute">
          Rumbo objetivo: <span className="text-green">{TARGET_HEADING}°</span> · Rumbo actual:{" "}
          <span className={`tabular-nums ${onCourse ? "text-phosphor" : "text-text"}`}>
            {String(heading).padStart(3, "0")}°
          </span>
        </p>

        {/* Compass strip 000–360: target window + current heading marker */}
        <div aria-hidden className="relative mt-3 h-3 border border-border-strong">
          <div
            className="absolute inset-y-0 bg-green-soft"
            style={{ left: pct(WINDOW_MIN), width: pct(WINDOW_MAX - WINDOW_MIN) }}
          />
          <div className="absolute inset-y-0 w-px bg-green" style={{ left: pct(TARGET_HEADING) }} />
          <div
            className={`absolute -inset-y-1 w-0.5 ${onCourse ? "bg-phosphor" : "bg-text"}`}
            style={{ left: pct(heading) }}
          />
        </div>
        <div aria-hidden className="mt-1 flex justify-between text-[10px] text-text-dim">
          <span>N</span>
          <span>E</span>
          <span>S</span>
          <span>W</span>
          <span>N</span>
        </div>
      </div>
    </div>
  );
}
