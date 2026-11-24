"use client";

import { useEffect, useState } from "react";
import { UNMOOR_EVENT, headingToDegrees, useBoatTelemetry } from "./BoatTelemetry";
import IntroOverlay from "./IntroOverlay";
import { METERS_PER_UNIT } from "./scale";
import { TURN_BUOY } from "./waypoints-data";

// INTRO (briefing) → AMARRADO (DESAMARRAR) → VERDE (go up to the km 98 green
// buoy) → GIRANDO (turn 180° working ahead/astern + rudder) → AGUAS_ABAJO
// (8 s, then the HUD is the only UI).
type Phase = "INTRO" | "AMARRADO" | "VERDE" | "GIRANDO" | "AGUAS_ABAJO" | "DONE";

const POLL_MS = 100;
const AT_BUOY = 10; // u
const TARGET = 180; // ° south
const TARGET_TOLERANCE = 20;
const DOWNSTREAM_MS = 8000;

/** Signed smallest difference a − b in degrees (−180..180). */
const angleDiff = (a: number, b: number) => ((a - b + 540) % 360) - 180;

export default function TutorialOverlay() {
  const telemetry = useBoatTelemetry();
  const [phase, setPhase] = useState<Phase>("INTRO");
  const [heading, setHeading] = useState(0);
  const [buoy, setBuoy] = useState({ meters: 0, relBearing: 0 });

  // Track the boat while guiding (VERDE / GIRANDO)
  useEffect(() => {
    if (phase !== "VERDE" && phase !== "GIRANDO") return;
    const id = window.setInterval(() => {
      const t = telemetry.current;
      const deg = headingToDegrees(t.heading);
      const dx = TURN_BUOY[0] - t.x;
      const dz = TURN_BUOY[2] - t.z;
      const dist = Math.hypot(dx, dz);
      const bearing = ((Math.atan2(dx, -dz) * 180) / Math.PI + 360) % 360; // nautical, 000 = N
      setHeading(deg);
      setBuoy({ meters: Math.round((dist * METERS_PER_UNIT) / 10) * 10, relBearing: angleDiff(bearing, deg) });
      if (phase === "VERDE" && dist < AT_BUOY) setPhase("GIRANDO");
      // Heading south ± 20° and making way ahead (i.e. moving downstream, +Z)
      if (phase === "GIRANDO" && Math.abs(angleDiff(deg, TARGET)) <= TARGET_TOLERANCE && t.velocity > 0.05) {
        setPhase("AGUAS_ABAJO");
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [phase, telemetry]);

  useEffect(() => {
    if (phase !== "AGUAS_ABAJO") return;
    const id = window.setTimeout(() => setPhase("DONE"), DOWNSTREAM_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (phase === "INTRO") return <IntroOverlay onStart={() => setPhase("AMARRADO")} />;

  if (phase === "AMARRADO") {
    return (
      <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center px-4">
        <div className="pointer-events-auto w-full max-w-md border border-green bg-bg/70 p-6 text-center font-mono backdrop-blur">
          <p className="text-sm font-bold tracking-wider text-green">◉ B/T NANY amarrado</p>
          <p className="mt-1 text-xs tracking-wider text-text-mid">Terminal AXION · Campana · km 97</p>
          <button
            type="button"
            autoFocus
            onClick={() => {
              window.dispatchEvent(new CustomEvent(UNMOOR_EVENT));
              setPhase("VERDE");
            }}
            className="mt-6 cursor-pointer rounded border-2 border-green bg-bg/90 px-8 py-4 font-mono text-lg font-bold text-green transition-colors hover:bg-green hover:text-bg"
          >
            DESAMARRAR ◉
          </button>
        </div>
      </div>
    );
  }

  const done = phase === "DONE" || phase === "AGUAS_ABAJO";
  const onCourse = Math.abs(angleDiff(heading, TARGET)) <= TARGET_TOLERANCE;

  return (
    <div
      aria-hidden={phase === "DONE"}
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4 transition-opacity duration-700 ${
        phase === "DONE" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-xl border border-green bg-bg/75 p-4 font-mono backdrop-blur">
        {phase === "VERDE" && (
          <div className="flex items-start gap-4">
            {/* Arrow toward the green buoy, relative to the bow */}
            <div aria-hidden className="flex w-16 shrink-0 flex-col items-center">
              <span
                className="block text-3xl leading-none text-green glow-text transition-transform duration-150"
                style={{ transform: `rotate(${buoy.relBearing}deg)` }}
              >
                ↑
              </span>
              <span className="mt-1 text-xs text-green tabular-nums">{buoy.meters} m</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-green">◉ BUSCANDO LA VERDE</p>
              <p role="status" className="mt-1 font-sans text-sm text-text-mid">
                Avante despacio [W] hasta la boya verde aguas arriba. Está sobre tu babor, a ~{buoy.meters} m. Entre
                km 96 y 97.5 está prohibido girar.
              </p>
            </div>
          </div>
        )}

        {phase === "GIRANDO" && (
          <div className="flex items-start gap-4">
            <CompassRose heading={heading} onCourse={onCourse} />
            <div>
              <p className="text-sm font-bold tracking-wider text-green">◉ EN LA VERDE, GIRANDO</p>
              <p className="mt-1 font-sans text-sm text-text-mid">
                Al través de la boya verde. Girá 180° jugando con avante corto + atrás + timón alternando. El NANY no
                pivota en el lugar — hay que trabajar la maniobra.
              </p>
              <p role="status" className="mt-2 text-xs tracking-wider text-text-mute">
                Rumbo objetivo <span className="text-green">180° (S)</span> · actual{" "}
                <span className={`tabular-nums ${onCourse ? "text-phosphor" : "text-text"}`}>
                  {String(heading).padStart(3, "0")}°
                </span>
              </p>
            </div>
          </div>
        )}

        {done && (
          <>
            <p className="text-sm font-bold tracking-wider text-green">◉ AGUAS ABAJO</p>
            <p className="mt-1 font-sans text-sm text-text-mid">
              Rumbo al sur. Bajás por el Paraná de las Palmas pasando Hinojo, GNL Escobar, PNA LIMA, hasta Zona Común.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** Compass rose: N/E/S/W, highlighted 180° ± 20° target wedge, heading needle. */
function CompassRose({ heading, onCourse }: { heading: number; onCourse: boolean }) {
  const r = 34;
  const wedge = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180; // SVG: 0° = +x, nautical 0° = up
    return [40 + r * Math.cos(a), 40 + r * Math.sin(a)];
  };
  const [x1, y1] = wedge(TARGET - TARGET_TOLERANCE);
  const [x2, y2] = wedge(TARGET + TARGET_TOLERANCE);
  return (
    <svg viewBox="0 0 80 80" aria-hidden className="size-20 shrink-0">
      <circle cx="40" cy="40" r={r} fill="none" className="stroke-border-strong" strokeWidth="1" />
      <path d={`M40 40 L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`} className="fill-green-soft stroke-green" strokeWidth="0.75" />
      {(
        [
          ["N", 40, 11],
          ["E", 71, 43],
          ["S", 40, 75],
          ["W", 9, 43],
        ] as const
      ).map(([l, x, y]) => (
        <text key={l} x={x} y={y} textAnchor="middle" className="fill-text-mute font-mono" fontSize="8">
          {l}
        </text>
      ))}
      <g transform={`rotate(${heading} 40 40)`}>
        <line x1="40" y1="40" x2="40" y2="12" className={onCourse ? "stroke-phosphor" : "stroke-text"} strokeWidth="2" />
        <circle cx="40" cy="40" r="2.5" className={onCourse ? "fill-phosphor" : "fill-text"} />
      </g>
    </svg>
  );
}
