"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { Object3D, type Group, type InstancedMesh, type MeshStandardMaterial, type PointLight } from "three";
import { BANK_Y } from "./environment";

// Refinería Pan American Energy (Campana), on the west (mainland) bank. The
// skyline you see from the berth is the NORTH-WEST cluster (tall distillation
// towers with red nav lights and flares, LPG spheres, lit chimneys), ahead and
// to port of the moored NANY; tanks, a control building and two flare stacks
// continue south. Everything is on land: north cluster x ∈ [-45, -14],
// z ∈ [-52, -16]; south plot x ∈ [-75, -24], z ∈ [-11, 101].
// Three.js materials can't read the site's CSS theme tokens, so the hex
// colors below are intentional.
const STEEL = "#9aa3a8";
const STEEL_DARK = "#5f676c";
const WHITE = "#ecebe6";
const RED = "#b3261e";
const CONCRETE = "#8c8a84";
const FLAME_OUTER = "#ff7a1a";
const FLAME_INNER = "#ffd34d";
const NAV_RED = "#ff2a1a";
const SODIUM = "#ffc46b";

// North-west distillation towers: [x, z, radius, height]
const TOWERS: [number, number, number, number][] = [
  [-21, -40, 1.0, 15],
  [-26, -36, 0.8, 14],
  [-23, -47, 1.2, 15.5],
  [-31, -43, 0.9, 13],
];
/** Towers (by index) carrying a burning flare. */
const TOWER_FLARES = [0, 2];

// [x, z, height]
const CHIMNEYS: [number, number, number][] = [
  [-36, -36, 11],
  [-16, -49, 13],
];

const FLARE_H = 22;
const FLARES: [number, number][] = [
  [-66, 20],
  [-68, 72],
];

const SPHERE_R = 2;
const SPHERE_LEG_H = 1.4;
// Legs run from the ground up into the shell (top end hidden inside it)
const LEG_LEN = SPHERE_LEG_H + SPHERE_R * 0.6;
const SPHERES: [number, number][] = [
  [-29, -25],
  [-35, -27],
  [-34, -20],
];

// Warm work lights on the tower platforms and along the foot of the cluster
const WORK_LIGHTS: [number, number, number][] = [
  ...TOWERS.flatMap(([x, z, r, h]) =>
    [h * 0.35, h * 0.7].map((y): [number, number, number] => [x + r + 0.45, y + 0.2, z + 0.4]),
  ),
  ...[-20, -26, -32, -38, -44].map((z): [number, number, number] => [-15.5, 1.3, z]),
];
const NAV_LIGHTS: [number, number, number][] = [
  ...TOWERS.map(([x, z, r, h]): [number, number, number] => [x - r * 0.5, h + r + 0.25, z]),
  ...CHIMNEYS.map(([x, z, h]): [number, number, number] => [x, h + 0.25, z]),
];

// Horizontal bullet tanks, axis along Z: [x, z]
const TANKS: [number, number][] = [
  [-32, 55],
  [-28.5, 55],
  [-32, 67],
  [-28.5, 67],
];

const RACK_Y = BANK_Y + 2.6;
// Pipe racks as [x0, z0, x1, z1] runs (axis-aligned)
const RACKS: [number, number, number, number][] = [
  [-21, -45, -21, -31], // towers trunk (north cluster)
  [-36, -31, -21, -31], // LPG spheres / chimney → trunk
  [-47, 22, -47, 66], // south trunk
  [-47, 45, -30, 45], // trunk → horizontal tanks
  [-66, 22, -47, 22], // flare 1 header
  [-68, 70, -56, 70], // flare 2 header
];

// Rack posts every ~5 units along each run
const POSTS: [number, number][] = RACKS.flatMap(([x0, z0, x1, z1]) => {
  const len = Math.hypot(x1 - x0, z1 - z0);
  const n = Math.max(2, Math.round(len / 5) + 1);
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return [x0 + (x1 - x0) * t, z0 + (z1 - z0) * t] as [number, number];
  });
});

// LPG sphere legs: 6 per sphere around the equator footprint
const LEGS: [number, number][] = SPHERES.flatMap(([x, z]) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return [x + Math.cos(a) * SPHERE_R * 0.8, z + Math.sin(a) * SPHERE_R * 0.8] as [number, number];
  }),
);

// Write a list of (x, y, z) positions into an instancedMesh once
function usePlaced(ref: RefObject<InstancedMesh | null>, pts: [number, number][], y: number) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    pts.forEach(([x, z], i) => {
      o.position.set(x, y, z);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, pts, y]);
}

/** Flickering flame + warm point light, burning upward from `y`. */
function Flame({ y, phase, scale = 1 }: { y: number; phase: number; scale?: number }) {
  const flame = useRef<Group>(null);
  const light = useRef<PointLight>(null);

  // Flicker: two incommensurate sines + a fast jitter, no state per frame
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase;
    const f = 0.8 + 0.15 * Math.sin(t * 7.3) + 0.08 * Math.sin(t * 19.1) + 0.05 * Math.sin(t * 41.7);
    if (flame.current) flame.current.scale.set(1 + 0.1 * Math.sin(t * 11), f * 1.15, 1 + 0.1 * Math.cos(t * 13));
    if (light.current) light.current.intensity = 70 * f;
  });

  return (
    <group position={[0, y, 0]} scale={scale}>
      {/* Pivot group at the cone's base so the flicker scale grows upward */}
      <group ref={flame}>
        <mesh position={[0, 1.2, 0]}>
          <coneGeometry args={[0.65, 2.4, 8]} />
          <meshStandardMaterial color={FLAME_OUTER} emissive={FLAME_OUTER} emissiveIntensity={2.5} transparent opacity={0.85} />
        </mesh>
      </group>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color={FLAME_INNER} emissive={FLAME_INNER} emissiveIntensity={3} />
      </mesh>
      <pointLight ref={light} position={[0, 1.5, 0]} color={FLAME_INNER} intensity={70} distance={20} decay={2} />
    </group>
  );
}

function Flare({ x, z, phase }: { x: number; z: number; phase: number }) {
  return (
    <group position={[x, BANK_Y, z]}>
      <mesh position={[0, FLARE_H / 2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.55, FLARE_H, 8]} />
        <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.3} />
      </mesh>
      <Flame y={FLARE_H + 0.1} phase={phase} />
    </group>
  );
}

/** Red obstruction lights (slow blink) + steady sodium work lights. */
function NightLights() {
  const red = useRef<MeshStandardMaterial[]>([]);

  useFrame(({ clock }) => {
    red.current.forEach((m, i) => {
      m.emissiveIntensity = (clock.elapsedTime + i * 0.35) % 2 < 0.9 ? 3.5 : 0.15;
    });
  });

  return (
    <group>
      {NAV_LIGHTS.map((p, i) => (
        <mesh key={p.join()} position={p}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) red.current[i] = m;
            }}
            color={NAV_RED}
            emissive={NAV_RED}
            toneMapped={false}
          />
        </mesh>
      ))}
      {WORK_LIGHTS.map((p) => (
        <mesh key={p.join()} position={p}>
          <sphereGeometry args={[0.16, 6, 4]} />
          <meshStandardMaterial color={SODIUM} emissive={SODIUM} emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function RefineryPAE() {
  const posts = useRef<InstancedMesh>(null);
  const legs = useRef<InstancedMesh>(null);
  usePlaced(posts, POSTS, (RACK_Y + BANK_Y) / 2);
  usePlaced(legs, LEGS, BANK_Y + LEG_LEN / 2);
  const sphereY = BANK_Y + SPHERE_LEG_H + SPHERE_R * 0.85;

  return (
    <group>
      {/* Concrete plot pads: north cluster + south plot */}
      <mesh position={[-26.5, BANK_Y + 0.03, -34]} receiveShadow>
        <boxGeometry args={[25, 0.06, 36]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>
      <mesh position={[-49, BANK_Y + 0.03, 45]} receiveShadow>
        <boxGeometry args={[48, 0.06, 112]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>

      {/* Distillation towers: column + 2 ring platforms + dome cap */}
      {TOWERS.map(([x, z, r, h], i) => (
        <group key={`${x},${z}`} position={[x, BANK_Y, z]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[r, r, h, 10]} />
            <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.35} />
          </mesh>
          {[h * 0.35, h * 0.7].map((py) => (
            <mesh key={py} position={[0, py, 0]}>
              <cylinderGeometry args={[r + 0.45, r + 0.45, 0.12, 10]} />
              <meshStandardMaterial color={STEEL_DARK} roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, h, 0]}>
            <sphereGeometry args={[r, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.35} />
          </mesh>
          {TOWER_FLARES.includes(i) && (
            // Side stub so the flame clears the tower's nav light
            <group position={[r, 0, 0]}>
              <mesh position={[0, h + 0.6, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 1.6, 6]} />
                <meshStandardMaterial color={STEEL_DARK} />
              </mesh>
              <Flame y={h + 1.4} phase={i * 2.3} scale={0.85} />
            </group>
          )}
        </group>
      ))}

      {CHIMNEYS.map(([x, z, h]) => (
        <group key={z} position={[x, BANK_Y, z]}>
          <mesh position={[0, h / 2, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.7, h, 10]} />
            <meshStandardMaterial color={WHITE} roughness={0.8} />
          </mesh>
          <mesh position={[0, h - 0.8, 0]}>
            <cylinderGeometry args={[0.5, 0.52, 0.9, 10]} />
            <meshStandardMaterial color={RED} roughness={0.8} />
          </mesh>
        </group>
      ))}

      <NightLights />

      {/* Flares */}
      {FLARES.map(([x, z], i) => (
        <Flare key={i} x={x} z={z} phase={i * 3.7} />
      ))}

      {/* LPG spheres: white shell + red top cap, on legs */}
      {SPHERES.map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, sphereY, z]}>
          <mesh castShadow>
            <sphereGeometry args={[SPHERE_R, 16, 12]} />
            <meshStandardMaterial color={WHITE} roughness={0.5} />
          </mesh>
          <mesh>
            <sphereGeometry args={[SPHERE_R * 1.01, 16, 4, 0, Math.PI * 2, 0, Math.PI * 0.22]} />
            <meshStandardMaterial color={RED} roughness={0.6} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={legs} args={[undefined, undefined, LEGS.length]}>
        <cylinderGeometry args={[0.15, 0.15, LEG_LEN, 6]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.8} />
      </instancedMesh>

      {/* Horizontal storage tanks (axis along Z) */}
      {TANKS.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, BANK_Y + 1.5, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[1.2, 7, 4, 10]} />
          <meshStandardMaterial color={WHITE} roughness={0.55} />
        </mesh>
      ))}

      {/* Control building: low block + darker roof slab */}
      <group position={[-60, BANK_Y, 42]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[7, 2, 4]} />
          <meshStandardMaterial color="#d8d4ca" roughness={0.85} />
        </mesh>
        <mesh position={[0, 2.08, 0]}>
          <boxGeometry args={[7.3, 0.16, 4.3]} />
          <meshStandardMaterial color={STEEL_DARK} roughness={0.9} />
        </mesh>
      </group>

      {/* Pipe racks: one thin box bundle per run + instanced posts */}
      {RACKS.map(([x0, z0, x1, z1]) => {
        const along = x0 === x1;
        const len = along ? Math.abs(z1 - z0) : Math.abs(x1 - x0);
        return (
          <mesh key={`${x0},${z0},${x1},${z1}`} position={[(x0 + x1) / 2, RACK_Y, (z0 + z1) / 2]}>
            <boxGeometry args={along ? [0.9, 0.3, len] : [len, 0.3, 0.9]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.7} metalness={0.3} />
          </mesh>
        );
      })}
      <instancedMesh ref={posts} args={[undefined, undefined, POSTS.length]}>
        <boxGeometry args={[0.2, RACK_Y - BANK_Y, 0.2]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.8} />
      </instancedMesh>
    </group>
  );
}
