"use client";

import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { BANK_Y } from "./environment";
import { CAUSEWAY, JETTY, RIVER_CURVE, waterSdKnown } from "./river-geometry";

// River banks along the whole route. A world-sized grid would need far more
// vertices than needed, so the land is a RIBBON that follows the centerline: rows every
// 1 u along the river, columns at fixed offsets (dense near the banks, sparse
// far out, ±210 u — past the fog). Each vertex's height comes from the same
// signed-distance functions as the collision: flat land at BANK_Y, a short
// sloped bank, and a bed below the water wherever there's river, basin,
// estuary, canal or Delta channel. Past the ribbon the open water plane shows
// (beyond the fog, or the open estuary past the Zona Común).
const LAND_COLOR = "#3d5a3d";
const BED_Y = -0.6;
const SLOPE_IN = -1; // sd where the bed starts rising
const SLOPE_OUT = 0.6; // sd where flat land begins
const ROW_SPACING = 1;
// Dense across the 20 u river and its banks, sparse far out (past the fog).
const HALF_OFFSETS = [
  0, 2, 4, 6, 7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13, 14, 15, 16, 17.5, 19, 21, 23, 25, 28, 31, 35, 39, 44, 50,
  57, 65, 75, 87, 100, 120, 145, 175, 210,
];
const OFFSETS = [...HALF_OFFSETS.slice(1).reverse().map((o) => -o), ...HALF_OFFSETS]; // west (+) … east (−)

function bankHeight(sd: number) {
  if (sd <= SLOPE_IN) return BED_Y;
  if (sd >= SLOPE_OUT) return BANK_Y;
  const t = (sd - SLOPE_IN) / (SLOPE_OUT - SLOPE_IN);
  return BED_Y + (BANK_Y - BED_Y) * t * t * (3 - 2 * t); // smoothstep
}

function buildRibbon() {
  const rows = Math.ceil(RIVER_CURVE.getLength() / ROW_SPACING) + 1;
  const pts = RIVER_CURVE.getSpacedPoints(rows - 1);
  const cols = OFFSETS.length;
  const pos = new Float32Array(rows * cols * 3);

  for (let r = 0; r < rows; r++) {
    const a = pts[Math.max(0, r - 1)];
    const b = pts[Math.min(rows - 1, r + 1)];
    const len = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const wx = -(b.z - a.z) / len; // west normal = tangent rotated
    const wz = (b.x - a.x) / len;
    for (let c = 0; c < cols; c++) {
      const off = OFFSETS[c];
      const x = pts[r].x + wx * off;
      const z = pts[r].z + wz * off;
      const i = (r * cols + c) * 3;
      pos[i] = x;
      pos[i + 1] = bankHeight(waterSdKnown(x, z, Math.abs(off)));
      pos[i + 2] = z;
    }
  }

  const index = new Uint32Array((rows - 1) * (cols - 1) * 6);
  let k = 0;
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c;
      const b = a + cols;
      index.set([a, a + 1, b, a + 1, b + 1, b], k); // CCW from above → normals up
      k += 6;
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setIndex(new BufferAttribute(index, 1));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  return geo;
}

const JETTY_TOP = BANK_Y + 0.25;

export default function Shoreline() {
  // ~45k vertices, built once per visit
  const ribbon = useMemo(buildRibbon, []);
  const jettyW = JETTY.maxX - JETTY.minX;
  const jettyL = JETTY.maxZ - JETTY.minZ;
  const jettyX = (JETTY.minX + JETTY.maxX) / 2;
  const jettyZ = (JETTY.minZ + JETTY.maxZ) / 2;

  return (
    <>
      <mesh geometry={ribbon} receiveShadow>
        <meshStandardMaterial color={LAND_COLOR} roughness={0.9} />
      </mesh>

      {/* Terminal AXION jetty: the B/T NANY lies alongside, port side */}
      <mesh position={[jettyX, (JETTY_TOP - 0.6) / 2, jettyZ]} castShadow receiveShadow>
        <boxGeometry args={[jettyW, JETTY_TOP + 0.6, jettyL]} />
        <meshStandardMaterial color="#9a9a94" roughness={0.85} />
      </mesh>
      {/* Causeway back to the west bank */}
      <mesh
        position={[(CAUSEWAY.minX + CAUSEWAY.maxX) / 2, (JETTY_TOP - 0.6) / 2, (CAUSEWAY.minZ + CAUSEWAY.maxZ) / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[CAUSEWAY.maxX - CAUSEWAY.minX, JETTY_TOP + 0.6, CAUSEWAY.maxZ - CAUSEWAY.minZ]} />
        <meshStandardMaterial color="#9a9a94" roughness={0.85} />
      </mesh>
      {[-6, -2, 2, 6].map((dz) => (
        <mesh key={dz} position={[JETTY.maxX - 0.15, JETTY_TOP + 0.08, dz]}>
          <cylinderGeometry args={[0.07, 0.09, 0.16, 8]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}
    </>
  );
}
