"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type Ref } from "react";
import {
  Color,
  Object3D,
  type Group,
  type InstancedMesh,
  type MeshStandardMaterial,
} from "three";
import { BANK_Y } from "./environment";

// Aeroparque Jorge Newbery: Buenos Aires' city airport on the west coast of
// the estuary, seen to starboard from the Canal Mitre. Runway parallel to the
// coast, terminal + control tower, the city skyline behind, and an airliner
// on final every 30–45 s. Three.js materials can't read the site's CSS theme
// tokens → hex colors are intentional.
//
// Everything lives in a local frame centred on the runway:
//   local +X = river tangent (downstream, south-ish)
//   local +Z = inland (west-ish)
// rotation.y = atan2(-tz, tx) aligns local +X with the tangent; with that
// rotation local +Z lands exactly on the inland direction (-0.987, 0.158).
const TANGENT: [number, number] = [0.158, 0.987];
const FRAME_YAW = Math.atan2(-TANGENT[1], TANGENT[0]);
const RUNWAY_CENTER: [number, number] = [439.3, 4133.4];

const ASPHALT = "#2b2d30";
const PAINT = "#e8e8e8";
const APRON = "#55585c";
const TERMINAL = "#7d8fa0";
const TERMINAL_ROOF = "#c9ced3";
const TOWER = "#d7d9dc";
const CAB_GLASS = "#5fd0b8";
const WINDOWS = "#cfe6ff";
const EDGE_LIGHT = "#fff2c4";
const AVIATION_RED = "#ff2a1a";
const SKY_PALETTE = ["#8a929c", "#6f7a86", "#9aa6b2", "#5d6b7a", "#7f8c99", "#a9b1b8", "#4f5d6d"];

const RUNWAY_LEN = 105;
const RUNWAY_W = 2.5;
const HALF_LEN = RUNWAY_LEN / 2;
const PAINT_Y = BANK_Y + 0.02;

// Centerline dashes (3 long, every 6) + 6 threshold bars at each end
const DASHES = Array.from({ length: 15 }, (_, i) => -42 + i * 6);
const BAR_Z = [-0.95, -0.57, -0.19, 0.19, 0.57, 0.95];
const BARS = [-1, 1].flatMap((end) =>
  BAR_Z.map((z) => [end * (HALF_LEN - 2.2), z] as [number, number]),
);
// Edge lights every 7.5 along both runway edges
const EDGE_LIGHTS = Array.from({ length: 15 }, (_, i) => -HALF_LEN + 3.75 + i * 7.5).flatMap(
  (x) => [
    [x, -RUNWAY_W / 2 - 0.15],
    [x, RUNWAY_W / 2 + 0.15],
  ] as [number, number][],
);

const dummy = new Object3D();

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

// Flat items on the ground: [x, z] pairs scaled to (sx, sy, sz)
function fillFlat(
  mesh: InstancedMesh | null,
  items: [number, number][],
  y: number,
  scale: [number, number, number],
) {
  if (!mesh) return;
  items.forEach(([x, z], i) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(...scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

// --- City skyline ----------------------------------------------------------
// Generic towers 50–120 inland beyond the runway (≈120–190 from the channel),
// spread ±120 along the coast, keeping clear of the landmark slots below.
const LANDMARKS = [
  { x: -30, z: 72 }, // very tall slender tower
  { x: 28, z: 86 }, // stepped tower
  { x: -72, z: 62 }, // round tower
];
const BEACONS: [number, number, number][] = [
  [LANDMARKS[0].x, BANK_Y + 31.1, LANDMARKS[0].z],
  [LANDMARKS[1].x, BANK_Y + 20.2, LANDMARKS[1].z],
  [LANDMARKS[2].x, BANK_Y + 18.2, LANDMARKS[2].z],
];
type Block = { x: number; z: number; w: number; d: number; h: number; color: string };
const SKYLINE: Block[] = (() => {
  const rnd = mulberry32(1931);
  const out: Block[] = [];
  let guard = 0;
  while (out.length < 26 && guard++ < 500) {
    const x = -120 + rnd() * 240;
    const z = 50 + rnd() * 70;
    const w = 3 + rnd() * 4;
    const d = 3 + rnd() * 4;
    const clash = [...LANDMARKS, ...out].some(
      (b) => Math.abs(b.x - x) < 7 && Math.abs(b.z - z) < 7,
    );
    if (clash) continue;
    out.push({ x, z, w, d, h: 4 + rnd() * 10, color: SKY_PALETTE[out.length % SKY_PALETTE.length] });
  }
  return out;
})();

function Skyline() {
  const blocks = useRef<InstancedMesh>(null);
  const beacon = useRef<MeshStandardMaterial>(null);
  const beacons = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = blocks.current;
    if (!m) return;
    const c = new Color();
    SKYLINE.forEach(({ x, z, w, d, h, color }, i) => {
      dummy.position.set(x, BANK_Y + h / 2, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(w, h, d);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, c.set(color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
    const b = beacons.current;
    if (!b) return;
    BEACONS.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      b.setMatrixAt(i, dummy.matrix);
    });
    b.instanceMatrix.needsUpdate = true;
    b.computeBoundingSphere();
  }, []);

  // Aviation obstruction lights on the landmarks: slow red blink
  useFrame(({ clock }) => {
    const m = beacon.current;
    if (!m) return;
    m.emissiveIntensity = Math.sin(clock.elapsedTime * 2.2) > 0.2 ? 2.5 : 0.2;
  });

  const [tall, stepped, round] = LANDMARKS;
  return (
    <group>
      <instancedMesh ref={blocks} args={[undefined, undefined, SKYLINE.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.2} />
      </instancedMesh>

      {/* Very tall slender tower + mast */}
      <mesh position={[tall.x, BANK_Y + 13, tall.z]}>
        <boxGeometry args={[2.2, 26, 2.2]} />
        <meshStandardMaterial color="#6d7f93" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[tall.x, BANK_Y + 28.5, tall.z]}>
        <cylinderGeometry args={[0.08, 0.12, 5, 4]} />
        <meshStandardMaterial color="#9aa0a6" />
      </mesh>

      {/* Stepped (setback) tower */}
      <mesh position={[stepped.x, BANK_Y + 4.5, stepped.z]}>
        <boxGeometry args={[7, 9, 7]} />
        <meshStandardMaterial color="#8794a1" roughness={0.6} />
      </mesh>
      <mesh position={[stepped.x, BANK_Y + 12, stepped.z]}>
        <boxGeometry args={[5, 6, 5]} />
        <meshStandardMaterial color="#8f9ba7" roughness={0.6} />
      </mesh>
      <mesh position={[stepped.x, BANK_Y + 17.5, stepped.z]}>
        <boxGeometry args={[3, 5, 3]} />
        <meshStandardMaterial color="#97a3ae" roughness={0.6} />
      </mesh>

      {/* Round residential tower */}
      <mesh position={[round.x, BANK_Y + 9, round.z]}>
        <cylinderGeometry args={[1.7, 1.7, 18, 10]} />
        <meshStandardMaterial color="#a3acb5" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Obstruction beacons: one instanced mesh, one shared blinking material */}
      <instancedMesh ref={beacons} args={[undefined, undefined, BEACONS.length]}>
        <sphereGeometry args={[0.25, 6, 4]} />
        <meshStandardMaterial
          ref={beacon}
          color={AVIATION_RED}
          emissive={AVIATION_RED}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}

// --- Airliner --------------------------------------------------------------
// Low-poly 737-ish, ~2.1 units long. Nose → local +X, right wing → +Z.
// Origin at wheel level (fuselage centre 0.2 above).
const FUSELAGE = "#f4f4f4";
const LIVERY = "#2f6fb5";
const WING = "#c4c8cc";
const ENGINE = "#9da3a8";
const NAV_GREEN = "#22ff66";
const NAV_RED = "#ff2222";
const STROBE = "#ffffff";

const SWEEP = 0.45;
const WING_LEN = 0.95;
const WING_ROOT = { x: 0.1, y: 0.14, z: 0.1 };
const SIN_S = Math.sin(SWEEP);
const COS_S = Math.cos(SWEEP);
// Points along the (swept) right wing, mirrored for the left
const alongWing = (f: number, side: 1 | -1): [number, number, number] => [
  WING_ROOT.x - SIN_S * WING_LEN * f,
  WING_ROOT.y,
  side * (WING_ROOT.z + COS_S * WING_LEN * f),
];

function Airliner({ strobeRef }: { strobeRef: Ref<MeshStandardMaterial> }) {
  return (
    <group>
      {/* Fuselage + nose + tail cone */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.13, 1.8, 8]} />
        <meshStandardMaterial color={FUSELAGE} roughness={0.4} />
      </mesh>
      <mesh position={[1.0, 0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.22, 8]} />
        <meshStandardMaterial color={FUSELAGE} roughness={0.4} />
      </mesh>
      <mesh position={[-1.0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.22, 8]} />
        <meshStandardMaterial color={FUSELAGE} roughness={0.4} />
      </mesh>

      {/* Swept wings */}
      {([1, -1] as const).map((side) => (
        <mesh key={side} position={alongWing(0.5, side)} rotation={[0, -side * SWEEP, 0]}>
          <boxGeometry args={[0.32, 0.03, WING_LEN]} />
          <meshStandardMaterial color={WING} roughness={0.5} />
        </mesh>
      ))}

      {/* Engines under the wings */}
      {([1, -1] as const).map((side) => {
        const [x, , z] = alongWing(0.33, side);
        return (
          <mesh key={side} position={[x + 0.12, 0.06, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.06, 0.32, 7]} />
            <meshStandardMaterial color={ENGINE} roughness={0.4} metalness={0.3} />
          </mesh>
        );
      })}

      {/* Tail fin (swept back) + horizontal stabiliser */}
      <mesh position={[-0.85, 0.45, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.35, 0.42, 0.03]} />
        <meshStandardMaterial color={LIVERY} roughness={0.5} />
      </mesh>
      <mesh position={[-0.92, 0.24, 0]}>
        <boxGeometry args={[0.22, 0.025, 0.8]} />
        <meshStandardMaterial color={WING} roughness={0.5} />
      </mesh>

      {/* Navigation lights: green starboard (+Z), red port (-Z), tail strobe */}
      <mesh position={alongWing(1, 1)}>
        <sphereGeometry args={[0.045, 6, 4]} />
        <meshStandardMaterial color={NAV_GREEN} emissive={NAV_GREEN} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={alongWing(1, -1)}>
        <sphereGeometry args={[0.045, 6, 4]} />
        <meshStandardMaterial color={NAV_RED} emissive={NAV_RED} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      <mesh position={[-0.95, 0.68, 0]}>
        <sphereGeometry args={[0.045, 6, 4]} />
        <meshStandardMaterial
          ref={strobeRef}
          color={STROBE}
          emissive={STROBE}
          emissiveIntensity={4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// Final approach from the south along the runway axis (heading -X locally):
// 290 out at y=15 → ~3° glide → touchdown at the south threshold, then a
// rolling run accelerating to the north end, where it vanishes.
const APPROACH_DIST = 290;
const APPROACH_Y = 15;
const TOUCHDOWN_Y = BANK_Y + 0.1;
const AIR_SPEED = 22;
const ROLL_ACCEL = 4;
const APPROACH_TIME = APPROACH_DIST / AIR_SPEED;
const FLARE_PITCH = 0.06; // slight nose-up on final
const FIRST_APPROACH = 4; // seconds after mount

function FlightPath() {
  const plane = useRef<Group>(null);
  const attitude = useRef<Group>(null);
  const strobe = useRef<MeshStandardMaterial>(null);
  const start = useRef(-Infinity);
  const next = useRef(FIRST_APPROACH);

  useFrame(({ clock }) => {
    const g = plane.current;
    if (!g) return;
    const now = clock.elapsedTime;
    if (now >= next.current) {
      start.current = now;
      next.current = now + 30 + Math.random() * 15;
    }
    const t = now - start.current;

    let x: number;
    let y: number;
    let pitch = 0;
    if (t < APPROACH_TIME) {
      const k = t / APPROACH_TIME; // 0 → 1 along the glide slope
      x = HALF_LEN + APPROACH_DIST * (1 - k);
      y = APPROACH_Y + (TOUCHDOWN_Y - APPROACH_Y) * k;
      pitch = FLARE_PITCH;
    } else {
      const tr = t - APPROACH_TIME;
      const s = AIR_SPEED * tr + 0.5 * ROLL_ACCEL * tr * tr;
      if (s > RUNWAY_LEN) {
        g.visible = false;
        return;
      }
      x = HALF_LEN - s;
      y = TOUCHDOWN_Y;
    }
    g.visible = true;
    g.position.set(x, y, 0);
    if (attitude.current) attitude.current.rotation.z = pitch;
    if (strobe.current) strobe.current.emissiveIntensity = now % 1 < 0.12 ? 5 : 0;
  });

  // Outer group yawed 180° so the model's nose (+X) points north (-X local)
  return (
    <group ref={plane} rotation={[0, Math.PI, 0]} visible={false}>
      <group ref={attitude}>
        <Airliner strobeRef={strobe} />
      </group>
    </group>
  );
}

// --- Airport ---------------------------------------------------------------
export default function Aeroparque() {
  const dashes = useRef<InstancedMesh>(null);
  const bars = useRef<InstancedMesh>(null);
  const edges = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const flat = DASHES.map((x) => [x, 0] as [number, number]);
    fillFlat(dashes.current, flat, PAINT_Y, [3, 1, 0.15]);
    fillFlat(bars.current, BARS, PAINT_Y, [3, 1, 0.22]);
    fillFlat(edges.current, EDGE_LIGHTS, BANK_Y + 0.06, [1, 1, 1]);
  }, []);

  return (
    <group
      position={[RUNWAY_CENTER[0], 0, RUNWAY_CENTER[1]]}
      rotation={[0, FRAME_YAW, 0]}
    >
      {/* Runway */}
      <mesh position={[0, BANK_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[RUNWAY_LEN, RUNWAY_W]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.95} />
      </mesh>
      <instancedMesh ref={dashes} args={[undefined, undefined, DASHES.length]}>
        <boxGeometry args={[1, 0.005, 1]} />
        <meshStandardMaterial color={PAINT} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={bars} args={[undefined, undefined, BARS.length]}>
        <boxGeometry args={[1, 0.005, 1]} />
        <meshStandardMaterial color={PAINT} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={edges} args={[undefined, undefined, EDGE_LIGHTS.length]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial
          color={EDGE_LIGHT}
          emissive={EDGE_LIGHT}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Apron between runway and terminal */}
      <mesh position={[0, BANK_Y + 0.005, 7]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 9]} />
        <meshStandardMaterial color={APRON} roughness={0.95} />
      </mesh>

      {/* Terminal (local z ≈ 15 inland of the runway) */}
      <group position={[0, BANK_Y, 15]}>
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
          <boxGeometry args={[32, 6, 7]} />
          <meshStandardMaterial color={TERMINAL} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 6.2, -0.6]} castShadow>
          <boxGeometry args={[34, 0.4, 9]} />
          <meshStandardMaterial color={TERMINAL_ROOF} roughness={0.6} />
        </mesh>
        {/* Glazed band facing the runway */}
        <mesh position={[0, 3.5, -3.51]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[30, 1.6]} />
          <meshStandardMaterial
            color={WINDOWS}
            emissive={WINDOWS}
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Control tower at the north end of the terminal */}
      <group position={[-20, BANK_Y, 11]}>
        <mesh position={[0, 5.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.75, 11, 8]} />
          <meshStandardMaterial color={TOWER} roughness={0.6} />
        </mesh>
        <mesh position={[0, 11.7, 0]}>
          <cylinderGeometry args={[1.4, 1.1, 1.4, 8]} />
          <meshStandardMaterial
            color={CAB_GLASS}
            emissive={CAB_GLASS}
            emissiveIntensity={0.7}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 12.55, 0]}>
          <cylinderGeometry args={[1.6, 1.6, 0.3, 8]} />
          <meshStandardMaterial color={TOWER} roughness={0.6} />
        </mesh>
      </group>

      <Skyline />
      <FlightPath />
    </group>
  );
}
