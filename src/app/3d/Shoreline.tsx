"use client";

import { BANK_Y, LAND } from "./environment";

// River banks. Shapes come from LAND (also used for collision in BoatControls).
const BANK_COLOR = "#3d5a3d";

type Building = { pos: [number, number, number]; size: [number, number, number]; color: string };

const BUILDINGS: Building[] = [
  // Campana quay (x -10..10, z -10..-6): Tenaris Siderca mill + AXION/PAE tanks
  { pos: [-7, 1.5, -8], size: [5, 3, 3], color: "#8a8a8a" }, // Tenaris mill
  { pos: [-2, 2, -8.5], size: [2, 4, 2], color: "#777777" }, // Tenaris stack
  { pos: [3, 1, -8], size: [3, 2, 3], color: "#c9c2b0" }, // AXION tank
  { pos: [7.5, 1.2, -8], size: [3, 2.4, 3], color: "#c9c2b0" }, // AXION tank

  // North bank, scattered industry (z -70..-20)
  { pos: [40, 0.8, -26], size: [4, 1.6, 3], color: "#666666" },
  { pos: [95, 1, -28], size: [5, 2, 4], color: "#8a8a8a" },
  { pos: [150, 0.6, -25], size: [3, 1.2, 2], color: "#555555" },
  { pos: [210, 0.8, -27], size: [4, 1.6, 3], color: "#777777" },

  // South bank (z 170..240)
  { pos: [60, 0.6, 176], size: [3, 1.2, 2], color: "#555555" },
  { pos: [120, 1, 178], size: [5, 2, 4], color: "#8a6a4a" },
  { pos: [170, 0.8, 177], size: [4, 1.6, 3], color: "#999999" },
  { pos: [230, 0.6, 176], size: [3, 1.2, 2], color: "#666666" },
];

export default function Shoreline() {
  return (
    <>
      {LAND.map((r) => (
        <mesh
          key={`${r.minX},${r.minZ}`}
          position={[(r.minX + r.maxX) / 2, BANK_Y, (r.minZ + r.maxZ) / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[r.maxX - r.minX, r.maxZ - r.minZ]} />
          <meshStandardMaterial color={BANK_COLOR} roughness={0.9} />
        </mesh>
      ))}

      {BUILDINGS.map((b) => (
        <mesh key={b.pos.join(",")} position={[b.pos[0], b.pos[1] + BANK_Y, b.pos[2]]} castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}
