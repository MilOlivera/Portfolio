"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

// Puente Zárate–Brazo Largo, km 106: upstream of the Campana berth, past the
// Vuelta del Este S — a silhouette in the haze. Spans E–W across the upstream
// reach (river-geometry.ts → centerline x≈-25 at z=-104), towers on land.
// Scaled to stay a backdrop at that distance (deck clears any mast).
const Z = -104;
const TOWER_X = [-42, -8];
const TOWER_H = 12;
const DECK_Y = 4;
const DECK_W = 2.4;
const WHITE = "#e8e2d6";

// Cable fan: from each tower top down to anchor points along both deck edges
function buildCables() {
  const pts: number[] = [];
  const [west, east] = TOWER_X;
  const span = east - west;
  for (const tx of TOWER_X) {
    for (let i = 1; i <= 5; i++) {
      const reach = (span / 2) * (i / 5);
      const ax = tx === west ? west + reach : east - reach; // toward mid-span
      for (const side of [-1, 1]) {
        pts.push(tx, TOWER_H, Z, ax, DECK_Y + 0.5, Z + (side * DECK_W) / 2);
      }
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return geo;
}

export default function ZarateBridge() {
  const cables = useMemo(buildCables, []);
  const [west, east] = TOWER_X;

  return (
    <group>
      {TOWER_X.map((x) => (
        <mesh key={x} position={[x, TOWER_H / 2, Z]} castShadow>
          <boxGeometry args={[1, TOWER_H, 2]} />
          <meshStandardMaterial color={WHITE} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[(west + east) / 2, DECK_Y, Z]} castShadow receiveShadow>
        <boxGeometry args={[east - west, 1, DECK_W]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <lineSegments geometry={cables}>
        <lineBasicMaterial color={WHITE} />
      </lineSegments>
    </group>
  );
}
