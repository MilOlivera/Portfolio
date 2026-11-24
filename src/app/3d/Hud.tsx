"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import CornerBrackets from "@/components/CornerBrackets";
import { headingToDegrees, useBoatTelemetry } from "./BoatTelemetry";
import { speedLimitAt, zoneAt } from "./route-info";
import { METERS_PER_UNIT, upsToKnots } from "./scale";
import { NEAR_DISTANCE, nearestWaypoint } from "./waypoints-data";

const MOBILE_MAX_WIDTH = 1024;
const REDIRECT_DELAY_MS = 2000;
const HELP_VISIBLE_MS = 10_000;
const READOUT_INTERVAL_MS = 100; // HUD refresh rate; the 3D loop itself runs at 60fps

function isTouchMobile() {
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return touch && window.innerWidth < MOBILE_MAX_WIDTH;
}

const noopSubscribe = () => () => {};

type Readout = {
  km: string;
  zone: string;
  vel: string;
  limit: number;
  rumbo: string;
  next: string;
  dist: string;
  near: boolean;
  notice: string;
  autoSlow: boolean;
};

const EMPTY: Readout = {
  km: "97.0",
  zone: "—",
  vel: "0.0",
  limit: 0,
  rumbo: "000",
  next: "—",
  dist: "—",
  near: false,
  notice: "",
  autoSlow: false,
};

/** Polls the telemetry ref and re-renders only when the formatted values change. */
function useReadout() {
  const telemetry = useBoatTelemetry();
  const [readout, setReadout] = useState<Readout>(EMPTY);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = telemetry.current;
      const { waypoint, distance } = nearestWaypoint(t.x, t.z);
      const zone = zoneAt(t.z);
      const next: Readout = {
        km: zone.km.toFixed(1),
        zone: zone.name,
        vel: upsToKnots(t.velocity).toFixed(1),
        limit: speedLimitAt(t.z).kn,
        rumbo: String(headingToDegrees(t.heading)).padStart(3, "0"),
        next: waypoint.title,
        dist: `${Math.round(distance * METERS_PER_UNIT)} m`,
        near: distance < NEAR_DISTANCE,
        notice: performance.now() < t.noticeUntil ? t.notice : "",
        autoSlow: performance.now() < t.autoSlowUntil,
      };
      setReadout((r) =>
        (Object.keys(next) as (keyof Readout)[]).every((k) => r[k] === next[k]) ? r : next,
      );
    }, READOUT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [telemetry]);

  return readout;
}

export default function Hud() {
  const router = useRouter();
  // Read once on the client; server snapshot is "desktop" (no redirect).
  const mobile = useSyncExternalStore(noopSubscribe, isTouchMobile, () => false);
  const { km, zone, vel, limit, rumbo, next, dist, near, notice, autoSlow } = useReadout();
  const [helpVisible, setHelpVisible] = useState(true);

  useEffect(() => {
    if (!mobile) return;
    const t = window.setTimeout(() => router.replace("/"), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [mobile, router]);

  useEffect(() => {
    const t = window.setTimeout(() => setHelpVisible(false), HELP_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (mobile) {
    return (
      <div
        role="status"
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 px-6 text-center"
      >
        <p className="font-mono text-sm tracking-widest text-green uppercase">
          Modo 3D optimizado para desktop
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <Link
          href="/"
          className="pointer-events-auto relative bg-bg/80 p-2 font-mono text-sm text-green backdrop-blur transition-shadow hover:glow-box"
        >
          <CornerBrackets size="size-2" glow={false} />
          &lt; back to cv
        </Link>

        <dl className="grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 bg-bg/80 p-2 font-mono text-xs tracking-wider backdrop-blur">
          <dt className="text-text-mute">KM:</dt>
          <dd className="text-green tabular-nums">{km}</dd>
          <dt className="text-text-mute">ZONA:</dt>
          <dd className="max-w-[26ch] text-text">{zone}</dd>
          <dt className="text-text-mute">VEL:</dt>
          <dd className={`tabular-nums ${autoSlow ? "font-bold text-warn" : "text-green"}`}>
            {vel} kn{" "}
            {autoSlow ? (
              <span className="text-warn">· AUTO-SLOW · AL TRAVÉS</span>
            ) : (
              <span className="text-text-mute">/ máx {limit}</span>
            )}
          </dd>
          <dt className="text-text-mute">RUMBO:</dt>
          <dd className="text-green tabular-nums">{rumbo}°</dd>
          <dt className="mt-1 border-t border-border pt-1 text-text-mute">VESSEL:</dt>
          <dd className="mt-1 border-t border-border pt-1 text-text">B/T NANY · IMO 9018115</dd>
          <dt className="text-text-mute">CARGO:</dt>
          <dd className="text-text">IFO 380</dd>
          <dt className="text-text-mute">NEXT:</dt>
          <dd className={`max-w-[26ch] ${near ? "font-bold text-phosphor glow-text" : "text-text"}`}>{next}</dd>
          <dt className="text-text-mute">DIST:</dt>
          <dd className={`tabular-nums ${near ? "font-bold text-phosphor glow-text" : "text-green"}`}>{dist}</dd>
        </dl>
      </div>

      {/* Physics notices: regulatory max speed, out of the dredged channel */}
      <div
        role="status"
        className={`pointer-events-none fixed inset-x-0 top-28 z-20 flex justify-center px-4 transition-opacity duration-300 ${
          notice ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="rounded border-2 border-warn/70 bg-bg/90 px-4 py-2 font-mono text-sm font-bold tracking-wider text-warn backdrop-blur">
          ⚠ {notice || "\u00a0"}
        </p>
      </div>

      <p
        aria-hidden={!helpVisible}
        className={`pointer-events-none fixed bottom-4 left-4 z-10 rounded bg-bg/70 p-2 font-mono text-xs text-green/60 backdrop-blur transition-opacity duration-1000 ${
          helpVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        [W A S D] mover · [SHIFT] boost · [SPACE] freno · [V] cambiar cámara
      </p>
    </>
  );
}
