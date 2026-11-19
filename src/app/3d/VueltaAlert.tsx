"use client";

import { useEffect, useState } from "react";
import { UNMOOR_EVENT, useBoatTelemetry } from "./BoatTelemetry";
import { activeVuelta } from "./waypoints-data";

const POLL_MS = 100;

/**
 * "⚠ APROXIMACIÓN A …" banner while the boat is inside a vuelta's alertRadius
 * (closest one wins). Hidden while moored — Campana's vuelta is within range
 * of the berth and would stack on top of the undocking tutorial.
 */
export default function VueltaAlert() {
  const telemetry = useBoatTelemetry();
  const [underway, setUnderway] = useState(false);
  const [title, setTitle] = useState<string | null>(null); // active vuelta
  const [shown, setShown] = useState<string>(""); // last title, kept during fade-out

  useEffect(() => {
    const onUnmoor = () => setUnderway(true);
    window.addEventListener(UNMOOR_EVENT, onUnmoor);
    return () => window.removeEventListener(UNMOOR_EVENT, onUnmoor);
  }, []);

  useEffect(() => {
    if (!underway) return;
    const id = window.setInterval(() => {
      const t = telemetry.current;
      const next = activeVuelta(t.x, t.z)?.title ?? null;
      setTitle(next);
      if (next) setShown(next);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [underway, telemetry]);

  const visible = title !== null;

  return (
    <div
      role="status"
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
      }`}
    >
      <div className="rounded border-2 border-warn/70 bg-bg/90 p-4 font-mono text-warn backdrop-blur">
        <p className="text-sm font-bold tracking-wider">⚠ APROXIMACIÓN A {shown}</p>
        <p className="mt-1 text-xs tracking-wider opacity-90">velocidad mínima · no adelantar · no cruzarse</p>
      </div>
    </div>
  );
}
