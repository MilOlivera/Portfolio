"use client";

// Visual-only river banks (no collision yet). Navigable corridor: z ∈ (-50, 50).
// Banks sit at y=0.3, just above the tallest wave crest (~0.25), so water
// never pokes through the land.
const BANK_Y = 0.3;
const BANK_COLOR = "#3d5a3d";

type Building = { pos: [number, number, number]; size: [number, number, number]; color: string };

const BUILDINGS: Building[] = [
  // Puerto Campana (west)
  { pos: [-90, 1, 70], size: [6, 2, 4], color: "#8a8a8a" }, // silo
  { pos: [-85, 0.8, 75], size: [4, 1.6, 3], color: "#aa6633" },
  { pos: [-80, 1.2, 68], size: [3, 2.4, 3], color: "#777777" },

  // Scattered fields / industry
  { pos: [-40, 0.6, 85], size: [3, 1.2, 2], color: "#555555" },
  { pos: [-10, 0.6, 88], size: [2, 1.2, 2], color: "#666666" },
  { pos: [30, 0.6, 82], size: [3, 1.2, 2], color: "#555555" },

  // Puerto Buenos Aires (centre-east)
  { pos: [70, 2, 75], size: [8, 4, 6], color: "#8a8a8a" },
  { pos: [75, 1.5, 80], size: [5, 3, 4], color: "#999999" },
  { pos: [80, 1, 85], size: [4, 2, 3], color: "#777777" },

  // La Plata / Rada (east)
  { pos: [110, 0.8, 80], size: [5, 1.6, 4], color: "#8a6a4a" },
  { pos: [115, 1.2, 85], size: [4, 2.4, 3], color: "#999999" },

  // South bank
  { pos: [-60, 0.6, -75], size: [3, 1.2, 2], color: "#555555" },
  { pos: [-20, 0.6, -80], size: [3, 1.2, 2], color: "#666666" },
  { pos: [40, 0.8, -78], size: [4, 1.6, 3], color: "#777777" },
  { pos: [100, 1, -82], size: [5, 2, 4], color: "#8a6a4a" },
];

export default function Shoreline() {
  return (
    <>
      {[90, -90].map((z) => (
        <mesh key={z} position={[0, BANK_Y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[280, 80]} />
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
