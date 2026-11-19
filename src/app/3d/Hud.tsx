"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import CornerBrackets from "@/components/CornerBrackets";
import { KNOTS_PER_UNIT, headingToDegrees, useBoatTelemetry } from "./BoatTelemetry";

const MOBILE_MAX_WIDTH = 1024;
const REDIRECT_DELAY_MS = 2000;
const HELP_VISIBLE_MS = 10_000;
const READOUT_INTERVAL_MS = 100; // HUD refresh rate; the 3D loop itself runs at 60fps

function isTouchMobile() {
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return touch && window.innerWidth < MOBILE_MAX_WIDTH;
}

const noopSubscribe = () => () => {};

/** Polls the telemetry ref and re-renders only when the formatted values change. */
function useReadout() {
  const telemetry = useBoatTelemetry();
  const [readout, setReadout] = useState({ speed: "0.0", heading: "000" });

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = telemetry.current;
      const speed = (t.velocity * KNOTS_PER_UNIT).toFixed(1);
      const heading = String(headingToDegrees(t.heading)).padStart(3, "0");
      setReadout((r) => (r.speed === speed && r.heading === heading ? r : { speed, heading }));
    }, READOUT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [telemetry]);

  return readout;
}

export default function Hud() {
  const router = useRouter();
  // Read once on the client; server snapshot is "desktop" (no redirect).
  const mobile = useSyncExternalStore(noopSubscribe, isTouchMobile, () => false);
  const { speed, heading } = useReadout();
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
          <dt className="text-text-mute">VESSEL:</dt>
          <dd className="text-text">B/T NANY · IMO 9018115</dd>
          <dt className="text-text-mute">CARGO:</dt>
          <dd className="text-text">IFO 380</dd>
          <dt className="text-text-mute">SPEED:</dt>
          <dd className="text-green tabular-nums">{speed} kn</dd>
          <dt className="text-text-mute">HEADING:</dt>
          <dd className="text-green tabular-nums">{heading}°</dd>
        </dl>
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
