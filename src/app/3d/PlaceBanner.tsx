"use client";

import { useEffect, useState } from "react";
import { UNMOOR_EVENT, useBoatTelemetry } from "./BoatTelemetry";
import { BROWN_FORK, activePlace } from "./waypoints-data";

const POLL_MS = 100;
const BROWN_MS = 6000;
const REARM_DISTANCE = 40; // go this far from the fork to be told again

/**
 * Top banner, one message at a time:
 *  · the km 12 fork: turn into Canal Brown (shown within range of the fork,
 *    gone after 6 s or once the boat is through)
 *  · otherwise the name of the place the boat is at ("▸ VUELTA CAMPANA")
 * Hidden while moored, so it doesn't stack on the undocking tutorial.
 */
export default function PlaceBanner() {
  const telemetry = useBoatTelemetry();
  const [underway, setUnderway] = useState(false);
  const [place, setPlace] = useState<string | null>(null);
  const [shown, setShown] = useState(""); // last place, kept during fade-out
  const [fork, setFork] = useState(false);

  useEffect(() => {
    const onUnmoor = () => setUnderway(true);
    window.addEventListener(UNMOOR_EVENT, onUnmoor);
    return () => window.removeEventListener(UNMOOR_EVENT, onUnmoor);
  }, []);

  useEffect(() => {
    if (!underway) return;
    let since = 0; // performance.now() the fork banner appeared; 0 = armed
    const id = window.setInterval(() => {
      const { x, z } = telemetry.current;
      const next = activePlace(x, z);
      setPlace(next);
      if (next) setShown(next);

      const dist = Math.hypot(x - BROWN_FORK.x, z - BROWN_FORK.z);
      const near = dist < BROWN_FORK.range;
      if (near && !since) since = performance.now();
      else if (dist > REARM_DISTANCE) since = 0;
      setFork(near && performance.now() - since < BROWN_MS);
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [underway, telemetry]);

  const fade = (visible: boolean) =>
    `pointer-events-none fixed inset-x-0 top-4 z-20 flex justify-center px-4 transition-all duration-500 ${
      visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
    }`;
  const box = "rounded border-2 border-warn/70 bg-bg/90 px-4 py-2.5 text-center font-mono backdrop-blur";

  return (
    <>
      <div role="status" aria-hidden={fork || !place} className={fade(!fork && place !== null)}>
        <p className={`${box} text-sm font-bold tracking-wider text-warn`}>▸ {shown}</p>
      </div>
      <div role="status" aria-hidden={!fork} className={fade(fork)}>
        <div className={box}>
          <p className="text-sm font-bold tracking-wider text-green">▸ GIRO A CANAL BROWN · destino Zona Común</p>
          <p className="mt-1 text-xs tracking-wider text-warn">⚠ no sigas por el Canal Acceso BA (decorativo)</p>
        </div>
      </div>
    </>
  );
}
