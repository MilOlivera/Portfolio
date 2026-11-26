"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";
import { START, UNMOOR_EVENT, useBoatTelemetry, type Telemetry } from "./BoatTelemetry";
import { SHORE_MARGIN, WORLD_BOUNDS } from "./environment";
import { navigableSd, outsideFairway, waterSd } from "./river-geometry";
import { OFF_FAIRWAY_KN, speedLimitAt } from "./route-info";
import { knotsToUps } from "./scale";
import { TIME_SCALE } from "./scale";
import {
  AUTO_SLOW_CANCEL_EVENT,
  AUTO_SLOW_EVENT,
  BERTH,
  BOAT_RADIUS,
  CAST_OFF_X,
  EXTRA_OBSTACLES,
  WAYPOINTS,
} from "./waypoints-data";

// Ship handling at 1 u = 20 m, in u/s of SIMULATION time (10 kn = 5.14 u/s;
// the clock multiplier is TIME_SCALE — see scale.ts). Tuned by simulation:
// the 180° turn at the green buoy takes a few ahead/astern cycles, and the
// route downstream clears every bank at cruise.
const ACCELERATION = 0.5; // u/s²
const BOOST_MULT = 1.5; // Shift: faster acceleration (the regulatory max still applies)
const DRAG = 0.25; // natural deceleration, u/s²
const BRAKE_MULT = 5; // Space: drag × this
const MAX_REVERSE = 0.75; // u/s astern (astern power is weaker than ahead)
const OVERSPEED_DECEL = 1; // u/s² when entering a slower zone
// Rudder: needs water flow past it. Below RUDDER_DEAD_SPEED it does nothing;
// effectiveness ramps up to full at RUDDER_FULL_SPEED (min radius ≈ 2 u, half
// a ship length — a hard-over rudder kick); at 10 kn the radius is ≈ 10 u.
const RUDDER_DEAD_SPEED = 0.3;
const RUDDER_FULL_SPEED = 1;
const TURN_RATE = 0.65; // rad/s at full effectiveness (+30% for the amplified vueltas)
const RIVER_DRIFT = 0.02; // u/s toward +Z (downstream current), whenever unmoored
const SOFT_ZONE = 6; // start slowing this far from the world limit
const BOUNCE_DAMPING = 0.3; // velocity multiplier when hitting something
const NOTICE_MS = 2000;
const OFF_FAIRWAY_HINT_S = 5; // after this long outside the fairway, suggest going back
const AUTO_SLOW_EASE = 4; // 1/s (real time): ease-out to the al-través speed in ~1 s
const MAX_SUBSTEP = 1 / 30; // s of sim time per physics substep
const CAST_OFF_S = 3; // real seconds sliding sideways off the quay after DESAMARRAR

// Blocking obstacles resolved once (no per-frame allocation)
const OBSTACLES: { x: number; z: number; r: number }[] = [
  ...WAYPOINTS.filter((w) => w.collisionRadius > 0).map((w) => ({ x: w.pos[0], z: w.pos[2], r: w.collisionRadius })),
  ...EXTRA_OBSTACLES.map((o) => ({ x: o.pos[0], z: o.pos[1], r: o.r })),
];

/**
 * What stops moving (x,z) → (nx,nz): an obstacle, the bank, or the shallows
 * outside the dredged channel. A move that gets AWAY from something you're
 * already touching is always allowed, so the boat never gets stuck.
 */
function blockedBy(x: number, z: number, nx: number, nz: number): "obstacle" | "shallow" | "bank" | null {
  for (const o of OBSTACLES) {
    const min = BOAT_RADIUS + o.r;
    const dx = nx - o.x;
    const dz = nz - o.z;
    const nextSq = dx * dx + dz * dz;
    if (nextSq < min * min) {
      const cx = x - o.x;
      const cz = z - o.z;
      if (nextSq < cx * cx + cz * cz) return "obstacle"; // getting closer
    }
  }
  const next = navigableSd(nx, nz);
  if (next > -SHORE_MARGIN && next > navigableSd(x, z)) {
    return waterSd(nx, nz) < 0 ? "shallow" : "bank";
  }
  return null;
}

function syncBoat(boat: Group | null, x: number, z: number, heading: number) {
  if (!boat) return;
  boat.position.set(x, 0, z);
  boat.rotation.y = heading;
}

function notify(t: Telemetry, text: string) {
  t.notice = text;
  t.noticeUntil = performance.now() + NOTICE_MS;
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

/** One handling step of `dt` simulated seconds (velocities in u/s of sim time). */
function simulate(t: Telemetry, k: Keys, dt: number) {
  // Outside the dredged fairway the hull scrapes: 3 kn max ("bajo fondo")
  const offFairway = outsideFairway(t.x, t.z);
  const zoneLimit = speedLimitAt(t.z);
  let limit =
    offFairway && OFF_FAIRWAY_KN < zoneLimit.kn ? { kn: OFF_FAIRWAY_KN, ups: knotsToUps(OFF_FAIRWAY_KN) } : zoneLimit;
  const autoSlow = performance.now() < t.autoSlowUntil && t.autoSlowKn < limit.kn;
  if (autoSlow) limit = { kn: t.autoSlowKn, ups: knotsToUps(t.autoSlowKn) };
  t.offFairway = offFairway ? t.offFairway + dt / TIME_SCALE : 0;
  if (offFairway) {
    notify(t, t.offFairway > OFF_FAIRWAY_HINT_S ? "VOLVÉ AL CANAL ENTRE LAS BOYAS" : "FUERA DEL CANAL · BAJO FONDO");
  }
  let v = t.velocity;

  // Engine / drag
  const thrust = (k.fwd ? 1 : 0) - (k.back ? 1 : 0);
  if (thrust > 0) v += ACCELERATION * (k.boost ? BOOST_MULT : 1) * dt;
  else if (thrust < 0) v -= ACCELERATION * dt;
  else v = decay(v, DRAG * dt);
  if (k.brake) v = decay(v, DRAG * BRAKE_MULT * dt);

  // Regulatory max speed for this stretch: the throttle clamps at it, and
  // entering a slower zone bleeds speed off. The HUD shows a banner.
  if (v < -MAX_REVERSE) v = -MAX_REVERSE;
  if (autoSlow && v > limit.ups) {
    // Al través: ease-out down to 2 kn in ~1 s (real time)
    v = limit.ups + (v - limit.ups) * Math.exp((-AUTO_SLOW_EASE * dt) / TIME_SCALE);
  } else if (v > limit.ups) {
    const wasAt = t.velocity <= limit.ups + 1e-3;
    v = wasAt ? limit.ups : Math.max(limit.ups, v - OVERSPEED_DECEL * dt);
    if (!offFairway && (thrust > 0 || !wasAt)) notify(t, `VEL MAX: ${limit.kn} KN`);
  }

  // Rudder: no flow, no steering; inverted astern (like a real ship)
  const rudder = (k.left ? 1 : 0) - (k.right ? 1 : 0);
  const speed = Math.abs(v);
  if (rudder !== 0 && speed >= RUDDER_DEAD_SPEED) {
    const effect = Math.min(1, speed / RUDDER_FULL_SPEED);
    t.heading += rudder * TURN_RATE * effect * Math.sign(v) * dt;
  }

  // Bow is local +X → world forward = (cos h, 0, -sin h), matching rotation.y = h
  const vx = Math.cos(t.heading) * v;
  const vz = -Math.sin(t.heading) * v + RIVER_DRIFT;

  // Soft world limit: damp speed when moving toward a nearby edge
  const gap = Math.min(
    vx > 0 ? WORLD_BOUNDS.maxX - t.x : vx < 0 ? t.x - WORLD_BOUNDS.minX : Infinity,
    vz > 0 ? WORLD_BOUNDS.maxZ - t.z : vz < 0 ? t.z - WORLD_BOUNDS.minZ : Infinity,
  );
  if (gap < SOFT_ZONE) v *= Math.exp(-6 * (1 - gap / SOFT_ZONE) * dt);

  const nx = Math.max(WORLD_BOUNDS.minX, Math.min(WORLD_BOUNDS.maxX, t.x + vx * dt));
  const nz = Math.max(WORLD_BOUNDS.minZ, Math.min(WORLD_BOUNDS.maxZ, t.z + vz * dt));
  const hit = blockedBy(t.x, t.z, nx, nz);
  if (hit) {
    v *= BOUNCE_DAMPING; // damped bounce: stop hard, keep position
    if (hit === "shallow") notify(t, "BAJO FONDO · NO NAVEGABLE");
  } else {
    t.x = nx;
    t.z = nz;
  }
  t.velocity = v;
}

export default function BoatControls({ boatRef }: { boatRef: RefObject<Group | null> }) {
  const telemetry = useBoatTelemetry();
  const keys = useRef<Keys>({ fwd: false, back: false, left: false, right: false, boost: false, brake: false });
  // Moored at AXION until the tutorial's DESAMARRAR fires `unmoor`
  const moored = useRef(true);
  const castOff = useRef(0); // 0..1 progress of the sideways departure

  useEffect(() => {
    const onUnmoor = () => {
      moored.current = false;
    };
    window.addEventListener(UNMOOR_EVENT, onUnmoor);
    return () => window.removeEventListener(UNMOOR_EVENT, onUnmoor);
  }, []);

  // Al-través carousel: clamp to its speed while it's open
  useEffect(() => {
    const t = telemetry.current;
    const onSlow = (e: Event) => {
      const { toKn, holdMs } = (e as CustomEvent<{ toKn: number; holdMs: number }>).detail;
      t.autoSlowKn = toKn;
      t.autoSlowUntil = performance.now() + holdMs;
    };
    const onCancel = () => {
      t.autoSlowUntil = 0;
    };
    window.addEventListener(AUTO_SLOW_EVENT, onSlow);
    window.addEventListener(AUTO_SLOW_CANCEL_EVENT, onCancel);
    return () => {
      window.removeEventListener(AUTO_SLOW_EVENT, onSlow);
      window.removeEventListener(AUTO_SLOW_CANCEL_EVENT, onCancel);
    };
  }, [telemetry]);

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
    const k = keys.current;
    const t = telemetry.current;

    // Moored: lines fast — every movement key is ignored, boat stays put
    if (moored.current) {
      t.velocity = 0;
      syncBoat(boatRef.current, t.x, t.z, t.heading);
      return;
    }

    // Casting off: the ships lie close ahead and astern, so the NANY first
    // opens sideways from the quay (lines and spring work), then answers keys.
    if (castOff.current < 1) {
      castOff.current = Math.min(1, castOff.current + Math.min(rawDelta, 0.1) / CAST_OFF_S);
      const p = castOff.current;
      t.x = BERTH[0] + (CAST_OFF_X - BERTH[0]) * p * p * (3 - 2 * p);
      t.velocity = 0;
      notify(t, "DESAMARRANDO · ABRIENDO DEL MUELLE");
      syncBoat(boatRef.current, t.x, t.z, t.heading);
      return;
    }

    // Fast-forward (TIME_SCALE): run the whole handling model faster than the
    // clock, in fixed substeps so collisions never tunnel through the jetty.
    const simDt = Math.min(rawDelta, 0.1) * TIME_SCALE;
    const steps = Math.ceil(simDt / MAX_SUBSTEP);
    for (let i = 0; i < steps; i++) simulate(t, k, simDt / steps);
    syncBoat(boatRef.current, t.x, t.z, t.heading);
  });

  return null;
}
