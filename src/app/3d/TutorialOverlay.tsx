"use client";

import { useEffect, useState } from "react";
import { headingToDegrees, useBoatTelemetry } from "./BoatTelemetry";

type Phase = "MOORED" | "TURNING" | "ALIGNED" | "SAILING";

const POLL_MS = 100;
const SAILING_SPEED = 0.5; // units/s forward → tutorial done
const NORTH_TOLERANCE = 30; // ° either side of 000 still counts as "moored heading"
const DOWNSTREAM_MIN = 150; // ° — downstream (south) window
const DOWNSTREAM_MAX = 210;

function phaseFor(velocity: number, heading: number): Phase {
  if (velocity > SAILING_SPEED) return "SAILING";
  const deg = headingToDegrees(heading);
  if (deg >= DOWNSTREAM_MIN && deg <= DOWNSTREAM_MAX) return "ALIGNED";
  if (deg <= NORTH_TOLERANCE || deg >= 360 - NORTH_TOLERANCE) return "MOORED";
  return "TURNING";
}

const STEP: Record<Exclude<Phase, "SAILING">, { title: string; body: string }> = {
  MOORED: { title: "▸ Volteá el barco aguas abajo", body: "Proa al norte, contra la corriente. Girá hasta rumbo 180° (sur)." },
  TURNING: { title: "▸ Girando... seguí", body: "Llevá la proa hasta rumbo 150°–210°, aguas abajo." },
  ALIGNED: { title: "▸ Rumbo correcto, presioná W", body: "Proa aguas abajo. Avante para zarpar." },
};

/** Guided undocking at Terminal AXION. Disappears for good once under way. */
export default function TutorialOverlay() {
  const telemetry = useBoatTelemetry();
  const [phase, setPhase] = useState<Phase>("MOORED");
  const done = phase === "SAILING";

  useEffect(() => {
    if (done) return; // latched: never comes back after sailing off
    const id = window.setInterval(() => {
      const t = telemetry.current;
      setPhase(phaseFor(t.velocity, t.heading));
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [telemetry, done]);

  const step = done ? null : STEP[phase as Exclude<Phase, "SAILING">];

  return (
    <div
      aria-hidden={done}
      className={`pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-4 transition-opacity duration-500 ${
        done ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-md border border-green bg-bg/70 p-6 font-mono backdrop-blur">
        <p className="text-sm font-bold tracking-wider text-green">◉ B/T NANY · AMARRADO</p>
        <p className="mt-1 text-xs tracking-wider text-text-mid">TERMINAL AXION PAE · KM 96.5 CAMPANA</p>
        <p className="mt-1 text-xs tracking-wider text-text-mid">▲ CARGA IFO 380 COMPLETADA ✓</p>

        {step && (
          <div role="status" className="mt-5 border-t border-dashed border-border-strong pt-4">
            <p className="text-sm text-green">{step.title}</p>
            <p className="mt-1 font-sans text-sm text-text-mid">{step.body}</p>
          </div>
        )}

        <p className="mt-5 text-[11px] tracking-wider text-text-mute">[A]/[D] girar · [W] avanzar</p>
      </div>
    </div>
  );
}
