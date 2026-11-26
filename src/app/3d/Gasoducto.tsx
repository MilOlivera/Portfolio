"use client";

import { Buoy } from "./NavBuoys";
import type { NavBuoy } from "./nav-buoys";
import { GASODUCTO } from "./waypoints-data";

// Submarine gas pipeline across the Zona Común: dashes on the surface tracing
// its run, with yellow special buoys (St Andrew's cross, 1 Hz yellow light).
// Passing close raises the HUD warning (Hud.tsx). Nothing here blocks.
const FIRST = GASODUCTO.buoyZs[0];
const LAST = GASODUCTO.buoyZs[GASODUCTO.buoyZs.length - 1];
const DASH = 1.4;
const DASH_STEP = 2.5;

const DASHES = Array.from(
  { length: Math.floor((LAST - FIRST) / DASH_STEP) },
  (_, i) => FIRST + DASH_STEP * (i + 0.5),
);

const BUOYS: NavBuoy[] = GASODUCTO.buoyZs.map((z) => ({
  id: `gasoducto-${z}`,
  kind: "yellow",
  pos: [GASODUCTO.x, 0, z],
  pulseHz: 1,
}));

export default function Gasoducto() {
  return (
    <>
      {DASHES.map((z, i) => (
        <mesh key={z} position={[GASODUCTO.x, 0.1, z]}>
          <boxGeometry args={[0.22, 0.05, DASH]} />
          <meshStandardMaterial color={i % 2 ? "#6b6f72" : "#141414"} />
        </mesh>
      ))}
      {BUOYS.map((b) => (
        <Buoy key={b.id} b={b} />
      ))}
    </>
  );
}
