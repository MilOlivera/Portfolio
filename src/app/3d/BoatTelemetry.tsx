"use client";

import { createContext, useContext, useRef, type ReactNode, type RefObject } from "react";

// Mutable boat state shared between the R3F tree (writes every frame) and the
// DOM HUD (polls it). A ref, not state, so the 3D loop never triggers renders.
// R3F's <Canvas> bridges parent context, so both trees see the same ref.
export type Telemetry = {
  velocity: number; // units/s along the heading, negative = astern
  heading: number; // radians, same as the boat group's rotation.y
  x: number;
  z: number;
  /** Short HUD banner set by the physics (speed limit, shallows…). */
  notice: string;
  /** performance.now() until which `notice` is shown. */
  noticeUntil: number;
  /** Real seconds spent continuously outside the dredged fairway. */
  offFairway: number;
  /** Al-través auto-slow: performance.now() until which speed is clamped to autoSlowKn. */
  autoSlowUntil: number;
  autoSlowKn: number;
};

/**
 * Moored at Terminal AXION, km 97 (world origin), alongside the jetty on the
 * port side, bow to the north (-Z), upstream. Bow is local +X → world forward
 * = (cos h, 0, -sin h), so north is h = +π/2.
 */
export const START: Telemetry = {
  velocity: 0,
  heading: Math.PI / 2,
  x: 0,
  z: 0,
  notice: "",
  noticeUntil: 0,
  offFairway: 0,
  autoSlowUntil: 0,
  autoSlowKn: 2,
};

/** Window event fired by the tutorial's "DESAMARRAR" button. */
export const UNMOOR_EVENT = "unmoor";

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

/** rotation.y → nautical degrees: 000 = N (-Z), 090 = E (+X), 180 = S, 270 = W. */
export function headingToDegrees(heading: number) {
  const deg = 90 - (heading * 180) / Math.PI;
  return ((Math.round(deg) % 360) + 360) % 360;
}
