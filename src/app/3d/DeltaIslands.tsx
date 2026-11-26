"use client";

import { useLayoutEffect, useRef } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import { BANK_Y } from "./environment";
import { VISUAL_HALF, besideRiver, waterSd } from "./river-geometry";

// Delta del Paraná: the whole east bank (port side sailing down) is low green
// delta, with willows and reeds along the waterline from the Campana berth to
// the end of Canal Brown. The stilt houses are DeltaHouses / DeltaCanals.
//
// Islands east of the Campana berth, in the
// non-navigable side channels behind a land strip (river-geometry.ts →
// DELTA_NEAR). Scenery only. Positions verified to clear the zone edges.
const ISLAND_COLOR = "#2a4a2a";
const LEAF = "#2f5a2f";
const TRUNK = "#5a4030";
const WILLOW = "#3f6b2a";
const REED = "#8a9a55";

type Island = { pos: [number, number]; size: number; squash: number; rot: number; trees: [number, number][] };

const ISLANDS: Island[] = [
  { pos: [38, -48], size: 4, squash: 0.7, rot: 0.4, trees: [[-0.6, 0.2], [0.7, -0.3]] },
  { pos: [34, -30], size: 5, squash: 0.8, rot: 1.1, trees: [[0, 0], [1.1, 0.5], [-1, -0.4]] },
  { pos: [30, -10], size: 3.5, squash: 0.6, rot: 0.2, trees: [[-0.5, 0], [0.6, 0.3]] },
  { pos: [44, -58], size: 5, squash: 0.75, rot: 2.0, trees: [[0, 0], [0.9, 0.3]] },
  { pos: [46, -36], size: 6, squash: 0.65, rot: 0.9, trees: [[-1.2, 0.2], [0.2, -0.4], [1.3, 0.3]] },
  { pos: [40, 8], size: 4, squash: 0.85, rot: 2.6, trees: [[0, 0.5], [0.8, -0.4]] },
  { pos: [56, -48], size: 5, squash: 0.55, rot: 0.6, trees: [[-1.2, 0], [0.4, 0.4], [1.4, -0.2]] },
  { pos: [58, -24], size: 6, squash: 0.7, rot: 1.7, trees: [[-0.9, -0.3], [0.9, 0.4]] },
  { pos: [66, -56], size: 4, squash: 0.8, rot: 0.3, trees: [[0, 0], [-0.7, 0.3]] },
  { pos: [52, 0], size: 4, squash: 0.6, rot: 1.3, trees: [[-0.8, 0], [0.7, 0.3]] },
  { pos: [66, -8], size: 5, squash: 0.75, rot: 2.2, trees: [[0, 0], [1, 0.4], [-1, -0.4]] },
  { pos: [56, 16], size: 3, squash: 0.8, rot: 0.8, trees: [[0, 0], [0.6, 0.3]] },
];

// ------------------------------------------------------ bank vegetation ----
const FROM_Z = 0;
const TO_Z = 545;
const STEP = 5.5; // one clump about every 5–8 u of bank
const TREES_PER_CLUMP = 3;
const REEDS_PER_CLUMP = 5;

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

type Plant = { x: number; z: number; h: number; tint: number };

/** Clumps on the first solid land east of the centerline (wherever the coast is). */
function plantBank() {
  const rnd = mulberry32(1516);
  const trees: Plant[] = [];
  const reeds: Plant[] = [];
  const onLand = (x: number, z: number) => waterSd(x, z) > 0.8;
  for (let z = FROM_Z; z <= TO_Z; z += STEP) {
    let edge = VISUAL_HALF + 1;
    while (edge < 90 && !onLand(...besideRiver(z, -edge))) edge += 1;
    const place = (out: Plant[], inland: number, along: number, h: number) => {
      const [x, pz] = besideRiver(z + along, -(edge + inland));
      if (onLand(x, pz)) out.push({ x, z: pz, h, tint: (rnd() - 0.5) * 0.1 });
    };
    for (let i = 0; i < TREES_PER_CLUMP; i++) place(trees, 0.8 + rnd() * 8, (rnd() - 0.5) * STEP, 0.8 + rnd() * 0.9);
    for (let i = 0; i < REEDS_PER_CLUMP; i++) place(reeds, rnd() * 0.8, (rnd() - 0.5) * STEP, 0.35 + rnd() * 0.45);
  }
  return { trees, reeds };
}

const BANK = plantBank();
const dummy = new Object3D();

/** One instance per plant: centre at `y` × its height, scaled by it. */
function fill(mesh: InstancedMesh | null, plants: Plant[], base: string, y: number, scale: (h: number) => [number, number, number]) {
  if (!mesh) return;
  const c = new Color();
  plants.forEach(({ x, z, h, tint }, i) => {
    dummy.position.set(x, BANK_Y + y * h, z);
    dummy.scale.set(...scale(h));
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, c.set(base).offsetHSL(0, 0, tint));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.computeBoundingSphere();
}

function BankVegetation() {
  const trunks = useRef<InstancedMesh>(null);
  const crowns = useRef<InstancedMesh>(null);
  const reeds = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    fill(trunks.current, BANK.trees, TRUNK, 0.25, (h) => [h, h * 0.5, h]);
    fill(crowns.current, BANK.trees, WILLOW, 0.75, (h) => [h * 0.65, h * 0.5, h * 0.65]);
    fill(reeds.current, BANK.reeds, REED, 0.5, (h) => [1, h, 1]);
  }, []);

  return (
    <>
      <instancedMesh ref={trunks} args={[undefined, undefined, BANK.trees.length]}>
        <cylinderGeometry args={[0.07, 0.1, 1, 5]} />
        <meshStandardMaterial color="#ffffff" />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, BANK.trees.length]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
      </instancedMesh>
      <instancedMesh ref={reeds} args={[undefined, undefined, BANK.reeds.length]}>
        <coneGeometry args={[0.07, 1, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </instancedMesh>
    </>
  );
}

export default function DeltaIslands() {
  return (
    <>
      <BankVegetation />
      {ISLANDS.map((isl) => (
        <group key={isl.pos.join(",")} position={[isl.pos[0], 0, isl.pos[1]]} rotation={[0, isl.rot, 0]}>
          {/* Low, irregular disc; top just above the wave crests */}
          <mesh position={[0, -0.05, 0]} scale={[1, 1, isl.squash]} receiveShadow>
            <cylinderGeometry args={[isl.size / 2, isl.size / 2 + 0.3, 0.4, 9]} />
            <meshStandardMaterial color={ISLAND_COLOR} roughness={0.95} flatShading />
          </mesh>
          {isl.trees.map(([tx, tz]) => (
            <group key={`${tx},${tz}`} position={[tx, 0.15, tz * isl.squash]} scale={0.6}>
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.6, 5]} />
                <meshStandardMaterial color={TRUNK} />
              </mesh>
              <mesh position={[0, 1.1, 0]} castShadow>
                <coneGeometry args={[0.55, 1.4, 7]} />
                <meshStandardMaterial color={LEAF} flatShading />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </>
  );
}
