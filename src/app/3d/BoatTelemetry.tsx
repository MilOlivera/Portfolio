"use client";

import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";

// Mutable boat state shared between the R3F tree (writes every frame) and the
// DOM HUD (polls it). A ref, not state, so the 3D loop never triggers renders.
// R3F's <Canvas> bridges parent context, so both trees see the same ref.
export type Telemetry = {
  velocity: number; // units/s, negative = astern
  heading: number; // radians, same as the boat group's rotation.y
  x: number;
  z: number;
};

/**
 * Moored at Terminal AXION (world origin), bow to the north (-Z), upstream.
 * Bow is local +X → world forward = (cos h, 0, -sin h), so north is h = +π/2.
 */
export const START: Telemetry = { velocity: 0, heading: Math.PI / 2, x: 0, z: 0 };

const TelemetryContext = createContext<RefObject<Telemetry> | null>(null);

export function BoatTelemetryProvider({ children }: { children: ReactNode }) {
  const ref = useRef<Telemetry>({ ...START });
  return <TelemetryContext value={ref}>{children}</TelemetryContext>;
}

export function useBoatTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) throw new Error("useBoatTelemetry must be used inside <BoatTelemetryProvider>");
  return ctx;
}

// Display conversions. Scale: hull 8 units ≈ 83 m, but true-scale speed would
// read ~160 kn, so knots are mapped for realism: MAX_SPEED 8 u/s → 12 kn.
export const KNOTS_PER_UNIT = 1.5;

/** rotation.y → nautical degrees: 000 = N (-Z), 090 = E (+X), 180 = S, 270 = W. */
export function headingToDegrees(heading: number) {
  const deg = 90 - (heading * 180) / Math.PI;
  return ((Math.round(deg) % 360) + 360) % 360;
}
