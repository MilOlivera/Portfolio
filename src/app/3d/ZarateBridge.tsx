"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

// Puente Zárate–Brazo Largo (Km ~100), crossing the Paraná upstream of the
// Campana berth — straight ahead of the bow when moored. Spans E–W across the
// upstream reach (river-geometry.ts → centerline x≈-1 at z=-25, banks at ±8),
// towers on land at both ends; the deck at y=10 clears the B/T NANY's mast.
const Z = -25;
const TOWER_X = [-12, 10];
const TOWER_H = 30;
const DECK_Y = 10;
const DECK_W = 6;
const WHITE = "#f2f2f2";

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
        <meshStandardMaterial color={WHITE} roughness={0.7} />
      </mesh>
      <lineSegments geometry={cables}>
        <lineBasicMaterial color={WHITE} />
      </lineSegments>
    </group>
  );
}
