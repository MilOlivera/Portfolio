"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";
import { START, UNMOOR_EVENT, useBoatTelemetry } from "./BoatTelemetry";
import { SHORE_MARGIN, WORLD_BOUNDS } from "./environment";
import { navigableSd } from "./river-geometry";
import { BOAT_RADIUS, WAYPOINTS } from "./waypoints-data";

export const MAX_SPEED = 8; // units/s
const MAX_REVERSE = 3;
const ACCELERATION = 2; // units/s²
const DRAG = 0.8; // natural deceleration, units/s²
const BRAKE_MULT = 5; // Space: drag × this
const TURN_SPEED = 0.8; // rad/s at MAX_SPEED
const BOOST_MULT = 1.5;
const SOFT_ZONE = 6; // start slowing this far from the world limit
const BOUNCE_DAMPING = 0.3; // velocity multiplier when hitting something

// Only blocking waypoints, resolved once (no per-frame allocation)
const OBSTACLES = WAYPOINTS.filter((w) => w.collisionRadius > 0);

/**
 * True if moving (x,z) → (nx,nz) runs into an obstacle or a river bank. A move that
 * gets AWAY from something you're already touching is always allowed, so the
 * boat can never get stuck (reverse out after a bump).
 */
function blocked(x: number, z: number, nx: number, nz: number) {
  for (const w of OBSTACLES) {
    const min = BOAT_RADIUS + w.collisionRadius;
    const dx = nx - w.pos[0];
    const dz = nz - w.pos[2];
    const nextSq = dx * dx + dz * dz;
    if (nextSq < min * min) {
      const cx = x - w.pos[0];
      const cz = z - w.pos[2];
      if (nextSq < cx * cx + cz * cz) return true; // getting closer
    }
  }
  // River banks: block a move that ends near/over land AND gets closer to it
  const next = navigableSd(nx, nz);
  return next > -SHORE_MARGIN && next > navigableSd(x, z);
}

function syncBoat(boat: Group | null, x: number, z: number, heading: number) {
  if (!boat) return;
  boat.position.set(x, 0, z);
  boat.rotation.y = heading;
}


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
  // Moored at AXION until the tutorial's "DESAMARRAR BUQUE" fires `unmoor`
  const moored = useRef(true);

  useEffect(() => {
    const onUnmoor = () => {
      moored.current = false;
    };
    window.addEventListener(UNMOOR_EVENT, onUnmoor);
    return () => window.removeEventListener(UNMOOR_EVENT, onUnmoor);
  }, []);

  useEffect(() => {
    const t = telemetry.current;
    Object.assign(t, START); // fresh voyage on every visit: moored at AXION

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

    // Moored: lines fast — every movement key is ignored, boat stays put
    if (moored.current) {
      t.velocity = 0;
      syncBoat(boatRef.current, t.x, t.z, t.heading);
      return;
    }

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

    // Rudder: turn rate is proportional to speed (no way on = no steering)
    // and flips astern, like a real ship
    const rudder = (k.left ? 1 : 0) - (k.right ? 1 : 0);
    t.heading += rudder * TURN_SPEED * (v / MAX_SPEED) * dt;

    // Bow is local +X → world forward = (cos h, 0, -sin h), matching rotation.y = h
    const dirX = Math.cos(t.heading);
    const dirZ = -Math.sin(t.heading);

    // Soft world limit: damp speed when moving toward a nearby edge
    const vx = dirX * v;
    const vz = dirZ * v;
    const gap = Math.min(
      vx > 0 ? WORLD_BOUNDS.maxX - t.x : vx < 0 ? t.x - WORLD_BOUNDS.minX : Infinity,
      vz > 0 ? WORLD_BOUNDS.maxZ - t.z : vz < 0 ? t.z - WORLD_BOUNDS.minZ : Infinity,
    );
    if (gap < SOFT_ZONE) v *= Math.exp(-6 * (1 - gap / SOFT_ZONE) * dt);

    const nx = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, t.x + dirX * v * dt));
    const nz = Math.max(WORLD_BOUNDS.minZ, Math.min(WORLD_BOUNDS.maxZ, t.z + dirZ * v * dt));
    if (blocked(t.x, t.z, nx, nz)) {
      v *= BOUNCE_DAMPING; // damped bounce: stop hard, keep position
    } else {
      t.x = nx;
      t.z = nz;
    }
    t.velocity = v;
    syncBoat(boatRef.current, t.x, t.z, t.heading);
  });

  return null;
}
