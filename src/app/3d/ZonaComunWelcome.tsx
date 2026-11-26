"use client";

import { useEffect, useState } from "react";
import CornerBrackets from "@/components/CornerBrackets";
import { useBoatTelemetry } from "./BoatTelemetry";
import { AUTO_SLOW_EVENT, WAYPOINTS, ZONA_COMUN_ENTRY_Z } from "./waypoints-data";

const POLL_MS = 200;
const SHOW_MS = 6000;
const SHIPS = WAYPOINTS.filter((w) => w.proximityDetection).length;

type Phase = "waiting" | "shown" | "gone";

/**
 * One-time mini HUD card on entering the Zona Común: tells the player each
 * anchored ship holds a project. Fades out after 6 s or as soon as the first
 * ship's carousel opens. Once per visit.
 */
export default function ZonaComunWelcome() {
  const telemetry = useBoatTelemetry();
  const [phase, setPhase] = useState<Phase>("waiting");

  useEffect(() => {
    if (phase !== "waiting") return;
    const id = window.setInterval(() => {
      if (telemetry.current.z > ZONA_COMUN_ENTRY_Z) setPhase("shown");
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [phase, telemetry]);

  useEffect(() => {
    if (phase !== "shown") return;
    const hide = () => setPhase("gone");
    const id = window.setTimeout(hide, SHOW_MS);
    window.addEventListener(AUTO_SLOW_EVENT, hide); // first ship approached / clicked
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(AUTO_SLOW_EVENT, hide);
    };
  }, [phase]);

  if (phase === "waiting") return null;

  return (
    <div
      aria-hidden={phase === "gone"}
      className={`pointer-events-none fixed inset-x-0 top-16 z-20 flex justify-center px-4 transition-opacity duration-400 ${
        phase === "shown" ? "opacity-100" : "opacity-0"
      }`}
    >
      <div role="status" className="relative border border-border-strong bg-bg/85 px-6 py-4 text-center font-mono backdrop-blur">
        <CornerBrackets size="size-2.5" />
        <p className="text-[11px] tracking-[0.3em] text-green">ZONA COMÚN</p>
        <p className="mt-1.5 text-sm font-bold text-text">Acercate a cada barco para ver el proyecto</p>
        <p className="mt-1 text-[11px] text-text-mute">
          {SHIPS} barcos fondeados · click sobre cualquiera o pasale cerca
        </p>
      </div>
    </div>
  );
}
