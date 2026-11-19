"use client";

import { useMemo } from "react";
import { PlaneGeometry } from "three";
import { BANK_Y, TERRAIN } from "./environment";
import { waterSd } from "./river-geometry";

// Winding river banks. Rather than offsetting strips along the curve (which
// self-intersect on tight bends like the Tordillo), the land is one terrain
// grid whose height follows the river's signed distance: flat land at BANK_Y,
// a short sloped bank, and a bed below the water wherever there's river.
// Same function family as the collision, so banks look where they block.
const BANK_COLOR = "#3d5a3d";
const BED_Y = -1.2;
const SLOPE_IN = -1.5; // sd where the bed starts rising
const SLOPE_OUT = 1; // sd where flat land begins

function bankHeight(sd: number) {
  if (sd <= SLOPE_IN) return BED_Y;
  if (sd >= SLOPE_OUT) return BANK_Y;
  const t = (sd - SLOPE_IN) / (SLOPE_OUT - SLOPE_IN);
  return BED_Y + (BANK_Y - BED_Y) * t * t * (3 - 2 * t); // smoothstep
}

function buildTerrain() {
  const w = TERRAIN.maxX - TERRAIN.minX;
  const d = TERRAIN.maxZ - TERRAIN.minZ;
  const geo = new PlaneGeometry(w, d, Math.round(w / TERRAIN.cell), Math.round(d / TERRAIN.cell));
  geo.rotateX(-Math.PI / 2); // XY plane → XZ ground
  geo.translate(TERRAIN.minX + w / 2, 0, TERRAIN.minZ + d / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, bankHeight(waterSd(pos.getX(i), pos.getZ(i))));
  }
  geo.computeVertexNormals();
  return geo;
}

type Building = { pos: [number, number, number]; size: [number, number, number]; color: string };

const BUILDINGS: Building[] = [
  // Campana industrial bank — PORT side (west), around the mooring row
  { pos: [-12, 1, 12], size: [3, 2, 3], color: "#c9c2b0" }, // AXION tank
  { pos: [-18, 1.2, 13], size: [3, 2.4, 3], color: "#c9c2b0" }, // AXION tank
  { pos: [-28, 1.5, 12], size: [6, 3, 4], color: "#8a8a8a" }, // warehouse
  { pos: [-42, 1, 13], size: [5, 2, 4], color: "#777777" },
  { pos: [-20, 1.5, -18], size: [6, 3, 4], color: "#8a8a8a" }, // Tenaris mill
  { pos: [-30, 2, -20], size: [2, 4, 2], color: "#777777" }, // Tenaris stack
  { pos: [-40, 1.2, -17], size: [5, 2.4, 3], color: "#8a8a8a" }, // Tenaris mill

  // North, scattered industry (east of the berth is Delta: nothing there)
  { pos: [95, 1, -28], size: [5, 2, 4], color: "#8a8a8a" },
  { pos: [150, 0.6, -25], size: [3, 1.2, 2], color: "#555555" },
  { pos: [210, 0.8, -27], size: [4, 1.6, 3], color: "#777777" },

  // South
  { pos: [60, 0.6, 176], size: [3, 1.2, 2], color: "#555555" },
  { pos: [120, 1, 178], size: [5, 2, 4], color: "#8a6a4a" },
  { pos: [170, 0.8, 177], size: [4, 1.6, 3], color: "#999999" },
  { pos: [230, 0.6, 176], size: [3, 1.2, 2], color: "#666666" },
];

export default function Shoreline() {
  // ~37k vertices, built once per visit (a few tens of ms)
  const terrain = useMemo(buildTerrain, []);

  return (
    <>
      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial color={BANK_COLOR} roughness={0.9} />
      </mesh>

      {BUILDINGS.map((b) => (
        <mesh key={b.pos.join(",")} position={[b.pos[0], b.pos[1] + BANK_Y, b.pos[2]]} castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={b.color} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}
