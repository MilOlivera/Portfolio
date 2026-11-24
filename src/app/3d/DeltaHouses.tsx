"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  DoubleSide,
  Object3D,
  type InstancedMesh,
  type MeshStandardMaterial,
} from "three";
import { BANK_Y } from "./environment";

// Paraná Delta stilt houses ("casas palafíticas"): small wooden bodies on piles
// so the floor stays above the floods, a tiny deck with stairs to the water, a
// skiff tied alongside, reeds and a weeping willow. Three.js materials can't
// read the site's CSS theme tokens → hex colors are intentional.
//
// Local frame: the FRONT (deck, door, window) faces local +X. Pass
// rotationY = Math.atan2(-fz, fx) to face world direction (fx, fz).
const WOOD = "#8b6a45";
const WOOD_DARK = "#5a4330";
const PILE = "#4a3a2a";
const ROOF = "#6b3f24";
const DOOR = "#3d2c1e";
const GLASS = "#1d2a33";
const WARM = "#ffb259";
const SKIFF = "#9c3b2e";
const REED = "#8a9a55";
const WILLOW = "#6f8f4a";
const TRUNK = "#4b3b2b";

const FLOOR_Y = 0.7; // floor top above the water
const PILE_BOTTOM = -0.4;
const BODY = { d: 1.0, h: 0.8, w: 1.2 }; // depth (X), height, width (Z)
const BODY_TOP = FLOOR_Y + BODY.h;
const PILES: [number, number][] = [
  [-0.45, -0.55],
  [0.45, -0.55],
  [-0.45, 0.55],
  [0.45, 0.55],
];

// Gable roof: a 3-segment cylinder is a triangular prism; rotated so the apex
// points up and the ridge runs along Z. Scaled to span the body + eaves.
const ROOF_W = 0.65 / 0.866; // base half-width 0.65 (0.1 eave overhang)
const ROOF_H = 0.42 / 1.5; // rise 0.42
const ROOF_Y = BODY_TOP + 0.5 * ROOF_H; // prism centroid → base on body top

// Stair plank: from the deck edge (x=0.9) down into the water (x=1.55)
const STAIR_DX = 0.65;
const STAIR_LEN = Math.hypot(STAIR_DX, FLOOR_Y);
const STAIR_ANGLE = Math.atan2(FLOOR_Y, STAIR_DX);

const REED_COUNT = 14;
const dummy = new Object3D();

// Tiny deterministic PRNG so every house gets its own (stable) reed layout
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

type Props = {
  position: [number, number, number];
  rotationY?: number;
  lit?: boolean;
};

export function DeltaHouse({ position, rotationY = 0, lit = false }: Props) {
  const windowMat = useRef<MeshStandardMaterial>(null);
  const piles = useRef<InstancedMesh>(null);
  const reeds = useRef<InstancedMesh>(null);
  const seed = Math.round(position[0] * 73 + position[2] * 31);
  const phase = (seed % 100) / 16;

  // Reeds scattered around the house, keeping clear of the house + skiff
  const reedXforms = useMemo(() => {
    const rnd = mulberry32(seed);
    const out: { x: number; z: number; h: number; tilt: number }[] = [];
    while (out.length < REED_COUNT) {
      const x = -1.4 + rnd() * 3.2;
      const z = -1.8 + rnd() * 3.6;
      const inHouse = x > -0.8 && x < 1.7 && z > -0.9 && z < 1.4;
      if (inHouse) continue;
      out.push({ x, z, h: 0.5 + rnd() * 0.5, tilt: (rnd() - 0.5) * 0.3 });
    }
    return out;
  }, [seed]);

  useLayoutEffect(() => {
    const p = piles.current;
    if (p) {
      PILES.forEach(([x, z], i) => {
        dummy.position.set(x, (PILE_BOTTOM + FLOOR_Y) / 2, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        p.setMatrixAt(i, dummy.matrix);
      });
      p.instanceMatrix.needsUpdate = true;
      p.computeBoundingSphere();
    }
    const r = reeds.current;
    if (r) {
      const c = new Color();
      reedXforms.forEach(({ x, z, h, tilt }, i) => {
        dummy.position.set(x, h / 2 - 0.05, z);
        dummy.rotation.set(tilt, 0, tilt * 0.7);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        r.setMatrixAt(i, dummy.matrix);
        r.setColorAt(i, c.set(REED).offsetHSL(0, 0, (i % 3) * 0.04 - 0.04));
      });
      r.instanceMatrix.needsUpdate = true;
      if (r.instanceColor) r.instanceColor.needsUpdate = true;
      r.computeBoundingSphere();
    }
  }, [reedXforms]);

  // Lit window: slow, gentle flicker like a lamp behind a curtain
  useFrame(({ clock }) => {
    const m = windowMat.current;
    if (!lit || !m) return;
    m.emissiveIntensity =
      1.3 + 0.35 * Math.sin(clock.elapsedTime * 0.8 + phase);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Piles: from the river bed up to the floor */}
      <instancedMesh ref={piles} args={[undefined, undefined, PILES.length]}>
        <cylinderGeometry args={[0.05, 0.06, FLOOR_Y - PILE_BOTTOM, 6]} />
        <meshStandardMaterial color={PILE} roughness={0.9} />
      </instancedMesh>

      {/* Floor platform, extended forward as a small deck */}
      <mesh position={[0.15, FLOOR_Y - 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.06, 1.35]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>

      {/* Body */}
      <mesh position={[-0.1, FLOOR_Y + BODY.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[BODY.d, BODY.h, BODY.w]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>

      {/* Gable roof (triangular prism, ridge along Z) */}
      <mesh
        position={[-0.1, ROOF_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[ROOF_W, BODY.w + 0.2, ROOF_H]}
        castShadow
      >
        <cylinderGeometry args={[1, 1, 1, 3]} />
        <meshStandardMaterial color={ROOF} roughness={0.8} flatShading />
      </mesh>

      {/* Door + window on the front face (x = 0.4) */}
      <mesh position={[0.401, FLOOR_Y + 0.25, -0.3]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.28, 0.5]} />
        <meshStandardMaterial color={DOOR} />
      </mesh>
      <mesh position={[0.401, FLOOR_Y + 0.45, 0.25]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.3, 0.24]} />
        <meshStandardMaterial
          ref={windowMat}
          color={lit ? WARM : GLASS}
          emissive={lit ? WARM : "#000000"}
          emissiveIntensity={lit ? 1.3 : 0}
          toneMapped={!lit}
        />
      </mesh>

      {/* Stair plank down to the water */}
      <mesh
        position={[0.9 + STAIR_DX / 2, FLOOR_Y / 2, -0.3]}
        rotation={[0, 0, -STAIR_ANGLE]}
      >
        <boxGeometry args={[STAIR_LEN, 0.05, 0.35]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>

      {/* Skiff moored alongside */}
      <mesh position={[0.9, 0.05, 1.05]} rotation={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.9, 0.14, 0.32]} />
        <meshStandardMaterial color={SKIFF} roughness={0.7} />
      </mesh>

      <instancedMesh ref={reeds} args={[undefined, undefined, REED_COUNT]}>
        <coneGeometry args={[0.03, 1, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </instancedMesh>

      {/* Low weeping willow behind the house, on the bank */}
      <group position={[-1.7, BANK_Y, 0.7]}>
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.9, 5]} />
          <meshStandardMaterial color={TRUNK} />
        </mesh>
        <mesh position={[0, 1.0, 0]} scale={[1, 0.65, 1]} castShadow>
          <sphereGeometry args={[0.55, 7, 5]} />
          <meshStandardMaterial color={WILLOW} roughness={1} flatShading />
        </mesh>
        {/* Drooping skirt of branches */}
        <mesh position={[0, 0.72, 0]} castShadow>
          <coneGeometry args={[0.75, 0.8, 8, 1, true]} />
          <meshStandardMaterial
            color={WILLOW}
            roughness={1}
            side={DoubleSide}
            flatShading
          />
        </mesh>
      </group>
    </group>
  );
}

// East-bank houses at the water's edge, fronts facing west toward the river
const HOUSES: { x: number; z: number; lit: boolean }[] = [
  { x: 14.7, z: 119.7, lit: true },
  { x: 24.3, z: 259.6, lit: false },
  { x: 26.4, z: 429.7, lit: false },
  { x: 38.0, z: 599.7, lit: true },
  { x: 47.6, z: 759.7, lit: false },
  { x: 55.7, z: 899.7, lit: false },
  { x: 61.6, z: 999.7, lit: true },
  { x: 94.9, z: 1249.3, lit: false },
  { x: 121.9, z: 1449.3, lit: false },
  { x: 156.9, z: 1649.2, lit: true },
];
const FACE_WEST = Math.PI; // atan2(-0, -1): front (+X local) → world -X

export default function DeltaHouses() {
  return (
    <group>
      {HOUSES.map(({ x, z, lit }) => (
        <DeltaHouse
          key={`${x}-${z}`}
          position={[x, 0, z]}
          rotationY={FACE_WEST}
          lit={lit}
        />
      ))}
    </group>
  );
}
