"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";
import { useBoatTelemetry } from "./BoatTelemetry";

export const MAX_SPEED = 8; // units/s
const MAX_REVERSE = 3;
const ACCELERATION = 2; // units/s²
const DRAG = 0.8; // natural deceleration, units/s²
const BRAKE_MULT = 5; // Space: drag × this
const TURN_SPEED = 0.8; // rad/s at MAX_SPEED
const BOOST_MULT = 1.5;
const BOUND = 120; // square sailing area; water follows the boat, so it never runs out
const SOFT_ZONE = 6; // start slowing this far from the limit

type Keys = { fwd: boolean; back: boolean; left: boolean; right: boolean; boost: boolean; brake: boolean };

const KEY_MAP: Record<string, keyof Keys> = {
  KeyW: "fwd",
  ArrowUp: "fwd",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  Space: "brake",
};

// Keys that would otherwise scroll the page
const PREVENT = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"]);

/** Moves toward 0 by `amount` without crossing it. */
function decay(v: number, amount: number) {
  return Math.abs(v) <= amount ? 0 : v - Math.sign(v) * amount;
}

export default function BoatControls({ boatRef }: { boatRef: RefObject<Group | null> }) {
  const telemetry = useBoatTelemetry();
  const keys = useRef<Keys>({ fwd: false, back: false, left: false, right: false, boost: false, brake: false });

  useEffect(() => {
    const t = telemetry.current;
    Object.assign(t, { velocity: 0, heading: 0, x: 0, z: 0 }); // fresh voyage on every visit

    const set = (e: KeyboardEvent, down: boolean) => {
      const k = KEY_MAP[e.code];
      if (!k) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      if (PREVENT.has(e.code)) e.preventDefault();
      keys.current[k] = down;
    };
    const onDown = (e: KeyboardEvent) => set(e, true);
    const onUp = (e: KeyboardEvent) => set(e, false);
    const reset = () => {
      for (const k of Object.keys(keys.current) as (keyof Keys)[]) keys.current[k] = false;
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", reset);
    };
  }, [telemetry]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1); // avoid jumps after a tab switch
    const k = keys.current;
    const t = telemetry.current;
    const boostMult = k.boost ? BOOST_MULT : 1;
    const maxFwd = MAX_SPEED * boostMult;
    let v = t.velocity;

    // Thrust / drag
    const thrust = (k.fwd ? 1 : 0) - (k.back ? 1 : 0);
    if (thrust > 0) v += ACCELERATION * boostMult * dt;
    else if (thrust < 0) v -= ACCELERATION * dt;
    else v = decay(v, DRAG * dt);
    if (k.brake) v = decay(v, DRAG * BRAKE_MULT * dt);

    // Clamp: reverse is hard-limited; over max forward (boost released) bleeds off
    if (v < -MAX_REVERSE) v = -MAX_REVERSE;
    if (v > maxFwd) v = Math.max(maxFwd, v - DRAG * 2 * dt);

    // Rudder: turn rate scales with speed (no turning while stopped), flips astern
    const rudder = (k.left ? 1 : 0) - (k.right ? 1 : 0);
    t.heading += rudder * TURN_SPEED * (v / MAX_SPEED) * dt;

    // Bow is local +X → world forward = (cos h, 0, -sin h), matching rotation.y = h
    const dirX = Math.cos(t.heading);
    const dirZ = -Math.sin(t.heading);

    // Soft boundary: damp speed when heading outward near the limit
    const outward = (p: number, d: number) => Math.abs(p) > BOUND - SOFT_ZONE && Math.sign(p) === Math.sign(d * v);
    if (outward(t.x, dirX) || outward(t.z, dirZ)) {
      const edge = Math.max(Math.abs(t.x), Math.abs(t.z));
      const closeness = Math.min(1, (edge - (BOUND - SOFT_ZONE)) / SOFT_ZONE); // 0..1
      v *= Math.exp(-6 * closeness * dt);
    }

    t.x = Math.max(-BOUND, Math.min(BOUND, t.x + dirX * v * dt));
    t.z = Math.max(-BOUND, Math.min(BOUND, t.z + dirZ * v * dt));
    t.velocity = v;

    const boat = boatRef.current;
    if (boat) {
      boat.position.set(t.x, 0, t.z);
      boat.rotation.y = t.heading;
    }
  });

  return null;
}
