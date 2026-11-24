"use client";

// Delta del Paraná islands starboard (east) of the Campana berth, in the
// non-navigable side channels behind a land strip (river-geometry.ts →
// DELTA_NEAR). Scenery only. Positions verified to clear the zone edges.
const ISLAND_COLOR = "#2a4a2a";
const LEAF = "#2f5a2f";
const TRUNK = "#5a4030";

type Island = { pos: [number, number]; size: number; squash: number; rot: number; trees: [number, number][] };

const ISLANDS: Island[] = [
  { pos: [24, -60], size: 4, squash: 0.7, rot: 0.4, trees: [[-0.6, 0.2], [0.7, -0.3]] },
  { pos: [32, -38], size: 5, squash: 0.8, rot: 1.1, trees: [[0, 0], [1.1, 0.5], [-1, -0.4]] },
  { pos: [27, -14], size: 3.5, squash: 0.6, rot: 0.2, trees: [[-0.5, 0], [0.6, 0.3]] },
  { pos: [41, -70], size: 5, squash: 0.75, rot: 2.0, trees: [[0, 0], [0.9, 0.3]] },
  { pos: [46, -24], size: 6, squash: 0.65, rot: 0.9, trees: [[-1.2, 0.2], [0.2, -0.4], [1.3, 0.3]] },
  { pos: [38, 5], size: 4, squash: 0.85, rot: 2.6, trees: [[0, 0.5], [0.8, -0.4]] },
  { pos: [56, -50], size: 5, squash: 0.55, rot: 0.6, trees: [[-1.2, 0], [0.4, 0.4], [1.4, -0.2]] },
  { pos: [59, -6], size: 6, squash: 0.7, rot: 1.7, trees: [[-0.9, -0.3], [0.9, 0.4]] },
  { pos: [66, -80], size: 4, squash: 0.8, rot: 0.3, trees: [[0, 0], [-0.7, 0.3]] },
  { pos: [51, 26], size: 4, squash: 0.6, rot: 1.3, trees: [[-0.8, 0], [0.7, 0.3]] },
  { pos: [68, 16], size: 5, squash: 0.75, rot: 2.2, trees: [[0, 0], [1, 0.4], [-1, -0.4]] },
  { pos: [24, 34], size: 3, squash: 0.8, rot: 0.8, trees: [[0, 0], [0.6, 0.3]] },
];

export default function DeltaIslands() {
  return (
    <>
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
