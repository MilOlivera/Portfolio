"use client";

// Delta del Paraná: small islands in the side channels south of the route and
// starboard (east) of the Campana berth. They sit in non-navigable water
// behind a land strip (river-geometry.ts → DELTA_*), so they're scenery only.
// Positions verified to clear the zone edges.
const ISLAND_COLOR = "#2a4a2a";
const LEAF = "#2f5a2f";
const TRUNK = "#5a4030";

type Island = { pos: [number, number]; size: number; squash: number; rot: number; trees: [number, number][] };

const ISLANDS: Island[] = [
  { pos: [8, 70], size: 5, squash: 0.7, rot: 0.4, trees: [[-0.8, 0.3], [0.9, -0.4]] },
  { pos: [16, 74], size: 6, squash: 0.8, rot: 1.1, trees: [[0, 0], [1.4, 0.6], [-1.2, -0.5]] },
  { pos: [26, 80], size: 7, squash: 0.6, rot: 0.2, trees: [[-1.8, 0], [0.4, 0.5], [2, -0.3], [-0.4, -0.8]] },
  { pos: [38, 72], size: 4, squash: 0.75, rot: 2.0, trees: [[0, 0], [0.9, 0.3]] },
  { pos: [46, 84], size: 5, squash: 0.65, rot: 0.9, trees: [[-0.7, 0.2], [0.8, -0.2]] },
  { pos: [12, 88], size: 6, squash: 0.85, rot: 2.6, trees: [[0, 0.8], [1.2, -0.6], [-1.3, -0.3]] },
  { pos: [22, 94], size: 8, squash: 0.55, rot: 0.6, trees: [[-2.2, 0], [-0.6, 0.6], [1, -0.4], [2.4, 0.3]] },
  { pos: [34, 90], size: 5, squash: 0.7, rot: 1.7, trees: [[-0.6, -0.3], [0.8, 0.4]] },
  { pos: [44, 100], size: 4, squash: 0.8, rot: 0.3, trees: [[0, 0], [-0.9, 0.3]] },
  { pos: [8, 102], size: 6, squash: 0.6, rot: 1.3, trees: [[-1.2, 0], [0.3, 0.5], [1.5, -0.3]] },
  { pos: [28, 104], size: 5, squash: 0.75, rot: 2.2, trees: [[0, 0], [1, 0.4], [-1, -0.4]] },
  { pos: [20, 68], size: 3, squash: 0.8, rot: 0.8, trees: [[0, 0], [0.7, 0.3]] },

  // Starboard of the Campana berth (east): Delta, no buildings
  { pos: [42, -22], size: 5, squash: 0.7, rot: 0.5, trees: [[-0.8, 0.2], [0.9, -0.3]] },
  { pos: [50, -8], size: 6, squash: 0.65, rot: 1.4, trees: [[0, 0.5], [1.3, -0.4], [-1.2, -0.2]] },
  { pos: [58, -30], size: 5, squash: 0.8, rot: 2.3, trees: [[-0.6, 0], [0.8, 0.4]] },
  { pos: [64, -14], size: 7, squash: 0.6, rot: 0.2, trees: [[-1.9, 0], [0.2, 0.5], [1.8, -0.3]] },
  { pos: [46, 4], size: 4, squash: 0.75, rot: 1.0, trees: [[0, 0], [0.8, -0.3]] },
  { pos: [72, -36], size: 5, squash: 0.7, rot: 2.8, trees: [[-0.7, 0.2], [0.8, -0.2]] },
  { pos: [70, 0], size: 6, squash: 0.6, rot: 0.7, trees: [[-1.2, 0], [0.3, 0.4], [1.4, -0.3]] },
  { pos: [56, -46], size: 4, squash: 0.8, rot: 1.9, trees: [[0, 0], [-0.8, 0.3]] },
];

export default function DeltaIslands() {
  return (
    <>
      {ISLANDS.map((isl) => (
        <group key={isl.pos.join(",")} position={[isl.pos[0], 0, isl.pos[1]]} rotation={[0, isl.rot, 0]}>
          {/* Low, irregular disc; top just above the wave crests */}
          <mesh position={[0, 0.05, 0]} scale={[1, 1, isl.squash]} receiveShadow>
            <cylinderGeometry args={[isl.size / 2, isl.size / 2 + 0.3, 0.6, 9]} />
            <meshStandardMaterial color={ISLAND_COLOR} roughness={0.95} flatShading />
          </mesh>
          {isl.trees.map(([tx, tz]) => (
            <group key={`${tx},${tz}`} position={[tx, 0.35, tz * isl.squash]}>
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
