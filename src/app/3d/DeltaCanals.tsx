"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import { DeltaHouse } from "./DeltaHouses";

// Delta side canals branching east off the river. The canal WATER is carved
// by the terrain elsewhere; this only dresses their banks with stilt houses
// and reed clumps at the mouth. Three.js materials can't read CSS theme
// tokens → hex colors are intentional.
const REED = "#8a9a55";
const HALF_WIDTH = 4;
const HOUSE_OFFSET = 5.2; // lateral, from the canal axis
const HOUSE_DIST = [22, 40, 62]; // along the axis, from the river centerline
const LIT_INDEX = 1; // one lit house per canal

type Canal = { start: [number, number]; axis: [number, number] };
const CANALS: Canal[] = [
  { start: [39.0, 700.0], axis: [0.998, -0.059] }, // Gobernador Arias
  { start: [174.0, 1800.0], axis: [0.991, -0.133] }, // Gobernador La Serna
  { start: [239.1, 2350.0], axis: [0.995, -0.102] }, // Canal de la Honda
];

const REEDS_PER_MOUTH = 28;
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

export default function DeltaCanals() {
  const reeds = useRef<InstancedMesh>(null);

  // Houses alternate sides (+/- perpendicular), each front facing the canal
  const houses = useMemo(
    () =>
      CANALS.flatMap(({ start: [sx, sz], axis: [ax, az] }, ci) => {
        const nx = -az; // left-hand perpendicular of the axis
        const nz = ax;
        return HOUSE_DIST.map((d, i) => {
          const side = i % 2 === 0 ? 1 : -1;
          const x = sx + ax * d + nx * HOUSE_OFFSET * side;
          const z = sz + az * d + nz * HOUSE_OFFSET * side;
          const fx = -nx * side; // facing back toward the axis
          const fz = -nz * side;
          return {
            key: `${ci}-${i}`,
            position: [x, 0, z] as [number, number, number],
            rotationY: Math.atan2(-fz, fx),
            lit: i === LIT_INDEX,
          };
        });
      }),
    [],
  );

  // Reed clumps on both banks of each canal mouth
  useLayoutEffect(() => {
    const r = reeds.current;
    if (!r) return;
    const rnd = mulberry32(4242);
    const c = new Color();
    let n = 0;
    CANALS.forEach(({ start: [sx, sz], axis: [ax, az] }) => {
      const nx = -az;
      const nz = ax;
      for (let k = 0; k < REEDS_PER_MOUTH; k++) {
        const side = k % 2 === 0 ? 1 : -1;
        const d = 10 + rnd() * 8;
        const lat = side * (HALF_WIDTH + 0.2 + rnd() * 1.6);
        const h = 0.5 + rnd() * 0.6;
        dummy.position.set(
          sx + ax * d + nx * lat,
          h / 2 - 0.05,
          sz + az * d + nz * lat,
        );
        dummy.rotation.set((rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3);
        dummy.scale.set(1, h, 1);
        dummy.updateMatrix();
        r.setMatrixAt(n, dummy.matrix);
        r.setColorAt(n, c.set(REED).offsetHSL(0, 0, (rnd() - 0.5) * 0.08));
        n++;
      }
    });
    r.instanceMatrix.needsUpdate = true;
    if (r.instanceColor) r.instanceColor.needsUpdate = true;
    r.computeBoundingSphere();
  }, []);

  return (
    <group>
      {houses.map(({ key, ...h }) => (
        <DeltaHouse key={key} {...h} />
      ))}
      <instancedMesh
        ref={reeds}
        args={[undefined, undefined, CANALS.length * REEDS_PER_MOUTH]}
      >
        <coneGeometry args={[0.035, 1, 4]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </instancedMesh>
    </group>
  );
}
