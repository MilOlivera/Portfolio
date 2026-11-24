"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";

// Puente Zárate–Brazo Largo, km 106: far upstream (north) of the Campana
// berth (km 97), ~450 u (9 km) ahead of the bow — a silhouette on the northern
// horizon. Spans E–W across the upstream reach (river-geometry.ts →
// centerline x≈45 at z=-450, banks ±3.75), towers on land.
// At that distance the scene fog (full at 200 u) would erase it, so its
// materials skip fog and use a pre-hazed tone instead: still reads as "far".
const Z = -450;
const TOWER_X = [37, 53];
const TOWER_H = 40;
const DECK_Y = 10;
const DECK_W = 6;
const WHITE = "#d9cdb8"; // white blended toward the horizon haze (#c4a885)

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
          <meshBasicMaterial color={WHITE} fog={false} />
        </mesh>
      ))}
      <mesh position={[(west + east) / 2, DECK_Y, Z]} castShadow receiveShadow>
        <boxGeometry args={[east - west, 1, DECK_W]} />
        <meshBasicMaterial color={WHITE} fog={false} />
      </mesh>
      <lineSegments geometry={cables}>
        <lineBasicMaterial color={WHITE} fog={false} />
      </lineSegments>
    </group>
  );
}
