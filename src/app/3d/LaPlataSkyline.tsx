"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import {
  Color,
  Object3D,
  Quaternion,
  Vector3,
  type InstancedMesh,
  type MeshStandardMaterial,
} from "three";
import { BANK_Y } from "./environment";

// Berisso / Ensenada / Puerto La Plata: a low urban-industrial coast past the
// end of Canal Brown, behind the malecones and TEC PLATA — rows of low buildings, refinery
// tanks and chimneys, and STS container cranes on the quay. Three.js
// materials can't read the site's CSS theme tokens → hex colors intentional.
//
// Local frame centred on the reference point (20 inland from the coast):
//   local +X = river tangent (downstream), local +Z = inland
//   coastline at local z = -20, channel centerline at z = -90.
const CENTER: [number, number] = [547.8, 4798.0];
const TANGENT: [number, number] = [0.2, 0.98];
const FRAME_YAW = Math.atan2(-TANGENT[1], TANGENT[0]);
const COAST_Z = -20;

const BUILDING_PALETTE = ["#9b8b7a", "#b5a58f", "#8c8f93", "#a06a55", "#c2bcb0", "#7c7f84", "#ad9a80"];
const QUAY = "#7a7a76";
const GROUND = "#4a4d45";
const CRANE_RED = "#c8402f";
const CRANE_WHITE = "#e6e6e2";
const TANK = "#d9d9d4";
const CHIMNEY = "#9a9590";
const POLE = "#555555";
const SODIUM = "#ffb347";
const WARNING_RED = "#ff2a1a";

const dummy = new Object3D();
const Z_AXIS = new Vector3(0, 0, 1);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V3 = [number, number, number];
// Unit-box instance: centre, size, optional quaternion, color
type Part = { p: V3; s: V3; q?: Quaternion; c: string };

function fillParts(mesh: InstancedMesh | null, parts: Part[]) {
  if (!mesh) return;
  const c = new Color();
  parts.forEach(({ p, s, q, c: col }, i) => {
    dummy.position.set(...p);
    if (q) dummy.quaternion.copy(q);
    else dummy.quaternion.identity();
    dummy.scale.set(...s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, c.set(col));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

// A straight beam (unit box stretched along its local Z) between two points
function beam(a: V3, b: V3, thick: number, c: string): Part {
  const va = new Vector3(...a);
  const dir = new Vector3(...b).sub(va);
  const len = dir.length();
  const mid = va.addScaledVector(dir, 0.5);
  return {
    p: [mid.x, mid.y, mid.z],
    s: [thick, thick, len],
    q: new Quaternion().setFromUnitVectors(Z_AXIS, dir.normalize()),
    c,
  };
}

// --- STS container cranes ----------------------------------------------------
// Portal on the quay, boom reaching out over the water (-Z), backreach inland.
const CRANE_X = [-22, -6, 10];
const CRANE_Z = COAST_Z + 2; // ≈72 west of the centerline
const LEG_H = 7;
const BOOM_Y = 7.6;
const BOOM_FRONT = -12; // outreach over the water
const BOOM_BACK = 6;
const APEX: V3 = [0, 10.6, 1.2];

function cranePartsAt(cx: number): Part[] {
  const g: V3 = [cx, BANK_Y, CRANE_Z];
  const at = (x: number, y: number, z: number): V3 => [g[0] + x, g[1] + y, g[2] + z];
  const parts: Part[] = [];
  for (const lx of [-1.3, 1.3]) {
    for (const lz of [-1.5, 1.5]) {
      parts.push({ p: at(lx, LEG_H / 2, lz), s: [0.3, LEG_H, 0.3], c: CRANE_RED });
    }
    parts.push({ p: at(lx, LEG_H, 0), s: [0.35, 0.5, 3.4], c: CRANE_RED }); // portal beam
    parts.push({ p: at(lx, 0.6, 0), s: [0.25, 0.25, 3.2], c: CRANE_RED }); // sill
  }
  for (const lz of [-1.5, 1.5]) {
    parts.push({ p: at(0, LEG_H - 0.4, lz), s: [2.9, 0.4, 0.3], c: CRANE_RED });
  }
  const boomLen = BOOM_BACK - BOOM_FRONT;
  parts.push({
    p: at(0, BOOM_Y, (BOOM_BACK + BOOM_FRONT) / 2),
    s: [0.8, 0.6, boomLen],
    c: CRANE_WHITE,
  });
  // A-frame posts + fore/back stays
  for (const lx of [-0.5, 0.5]) {
    parts.push(beam(at(lx, BOOM_Y, -1.2), at(lx * 0.3, APEX[1], APEX[2]), 0.2, CRANE_RED));
    parts.push(beam(at(lx, BOOM_Y, 2.8), at(lx * 0.3, APEX[1], APEX[2]), 0.2, CRANE_RED));
  }
  parts.push(beam(at(...APEX), at(0, BOOM_Y + 0.3, BOOM_FRONT), 0.12, CRANE_WHITE));
  parts.push(beam(at(...APEX), at(0, BOOM_Y + 0.3, BOOM_BACK), 0.12, CRANE_WHITE));
  // Machinery house on the backreach
  parts.push({ p: at(0, BOOM_Y + 0.9, 4.2), s: [1.6, 1.2, 2.4], c: CRANE_WHITE });
  return parts;
}
const CRANE_PARTS = CRANE_X.flatMap(cranePartsAt);

// --- Low buildings -----------------------------------------------------------
// ±150 along the coast, 0–60 inland from it; clear of the crane quay and the
// refinery tank farm.
const TANK_FARM = { x0: 52, x1: 108, z0: -2, z1: 26 };
const QUAY_ZONE = { x0: -34, x1: 22, z0: COAST_Z, z1: COAST_Z + 9 };
const inZone = (x: number, z: number, b: { x0: number; x1: number; z0: number; z1: number }) =>
  x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1;

const BUILDINGS: Part[] = (() => {
  const rnd = mulberry32(1882); // La Plata's founding year
  const out: Part[] = [];
  let guard = 0;
  while (out.length < 90 && guard++ < 1000) {
    const x = -150 + rnd() * 300;
    const z = COAST_Z + 3 + rnd() * 57;
    if (inZone(x, z, TANK_FARM) || inZone(x, z, QUAY_ZONE)) continue;
    const h = 1 + rnd() * 3;
    const w = 2 + rnd() * 4;
    const d = 2 + rnd() * 3;
    out.push({
      p: [x, BANK_Y + h / 2, z],
      s: [w, h, d],
      c: BUILDING_PALETTE[Math.floor(rnd() * BUILDING_PALETTE.length)],
    });
  }
  return out;
})();

// --- Refinery: storage tanks + two chimneys ------------------------------
const TANKS: [number, number][] = [
  [58, 2], [66, 2], [74, 2], [82, 2], [58, 12], [66, 12], [74, 12], [82, 12],
];
const CHIMNEYS: [number, number][] = [
  [96, 8],
  [102, 18],
];
const CHIMNEY_H = 9;

// --- Lights --------------------------------------------------------------
// Steady sodium floodlights on poles along the quay/industrial zone, and slow
// red warning blinkers on crane apexes and chimney tops.
const POLE_H = 2.6;
const FLOODS: [number, number][] = [
  [-32, COAST_Z + 1], [-14, COAST_Z + 1], [2, COAST_Z + 1], [18, COAST_Z + 1],
  [50, -4], [90, 0], [110, 10], [-60, -10], [-100, -12], [130, -8],
];
const BLINKERS: V3[] = [
  ...CRANE_X.map((cx): V3 => [cx, BANK_Y + APEX[1] + 0.25, CRANE_Z + APEX[2]]),
  ...CHIMNEYS.map(([x, z]): V3 => [x, BANK_Y + CHIMNEY_H + 0.3, z]),
];

export default function LaPlataSkyline() {
  const buildings = useRef<InstancedMesh>(null);
  const cranes = useRef<InstancedMesh>(null);
  const tanks = useRef<InstancedMesh>(null);
  const poles = useRef<InstancedMesh>(null);
  const floods = useRef<InstancedMesh>(null);
  const blinkers = useRef<InstancedMesh>(null);
  const blinkMat = useRef<MeshStandardMaterial>(null);

  useLayoutEffect(() => {
    fillParts(buildings.current, BUILDINGS);
    fillParts(cranes.current, CRANE_PARTS);
    fillParts(
      tanks.current,
      TANKS.map(([x, z]) => ({ p: [x, BANK_Y + 1.2, z], s: [1, 1, 1], c: TANK })),
    );
    fillParts(
      poles.current,
      FLOODS.map(([x, z]) => ({ p: [x, BANK_Y + POLE_H / 2, z], s: [1, 1, 1], c: POLE })),
    );
    fillParts(
      floods.current,
      FLOODS.map(([x, z]) => ({ p: [x, BANK_Y + POLE_H, z], s: [1, 1, 1], c: SODIUM })),
    );
    fillParts(
      blinkers.current,
      BLINKERS.map((p) => ({ p, s: [1, 1, 1], c: WARNING_RED })),
    );
  }, []);

  // Slow warning blink (~0.5 Hz), smooth rather than a hard on/off
  useFrame(({ clock }) => {
    const m = blinkMat.current;
    if (!m) return;
    const t = (Math.sin(clock.elapsedTime * Math.PI) + 1) / 2;
    m.emissiveIntensity = 0.2 + 2.8 * t * t;
  });

  return (
    <group position={[CENTER[0], 0, CENTER[1]]} rotation={[0, FRAME_YAW, 0]}>
      {/* Ground slab: it stands past the end of the terrain, over open water */}
      <mesh position={[0, BANK_Y - 0.17, COAST_Z + 31]} receiveShadow>
        <boxGeometry args={[310, 0.3, 62]} />
        <meshStandardMaterial color={GROUND} roughness={1} />
      </mesh>

      {/* Concrete quay along the crane berth */}
      <mesh position={[-6, BANK_Y + 0.05, COAST_Z + 3.5]} receiveShadow>
        <boxGeometry args={[56, 0.1, 7]} />
        <meshStandardMaterial color={QUAY} roughness={0.95} />
      </mesh>

      <instancedMesh ref={buildings} args={[undefined, undefined, BUILDINGS.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </instancedMesh>

      <instancedMesh ref={cranes} args={[undefined, undefined, CRANE_PARTS.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.3} />
      </instancedMesh>

      <instancedMesh ref={tanks} args={[undefined, undefined, TANKS.length]} castShadow>
        <cylinderGeometry args={[3, 3, 2.4, 14]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} metalness={0.3} />
      </instancedMesh>

      {CHIMNEYS.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, BANK_Y + CHIMNEY_H / 2, z]} castShadow>
          <cylinderGeometry args={[0.35, 0.6, CHIMNEY_H, 8]} />
          <meshStandardMaterial color={CHIMNEY} roughness={0.8} />
        </mesh>
      ))}

      <instancedMesh ref={poles} args={[undefined, undefined, FLOODS.length]}>
        <cylinderGeometry args={[0.05, 0.07, POLE_H, 5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={floods} args={[undefined, undefined, FLOODS.length]}>
        <sphereGeometry args={[0.18, 6, 4]} />
        <meshStandardMaterial
          color={SODIUM}
          emissive={SODIUM}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </instancedMesh>
      <instancedMesh ref={blinkers} args={[undefined, undefined, BLINKERS.length]}>
        <sphereGeometry args={[0.22, 6, 4]} />
        <meshStandardMaterial
          ref={blinkMat}
          color={WARNING_RED}
          emissive={WARNING_RED}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
