"use client";

import { useMemo } from "react";
import { DoubleSide } from "three";
import { Buoy } from "./NavBuoys";
import { lateralPair } from "./nav-buoys";
import { FAIRWAY_COLOR, FAIRWAY_Y, buildBand } from "./ZoneBands";

// Canal Brown: the sailed branch from the km 12 fork, through the Zona Común,
// down to Puerto La Plata. Its water and centerline are part of the river
// (river-geometry.ts); here go the dredged-lane strip and its IALA pairs
// (same side convention as the Canal Mitre).
const FROM_Z = 455;
const TO_Z = 640; // on past the end of the sailing area, into the haze
// Two pairs between the anchoring areas, three below them
const PAIRS_Z = [464, 485, 515, 527, 539];
const BUOYS = PAIRS_Z.flatMap((z) => lateralPair(z, `brown-${z}`));

export default function CanalBrown() {
  const fairway = useMemo(() => buildBand(FROM_Z, TO_Z, FAIRWAY_Y), []);

  return (
    <>
      <mesh geometry={fairway}>
        <meshBasicMaterial color={FAIRWAY_COLOR} transparent opacity={0.3} depthWrite={false} side={DoubleSide} />
      </mesh>
      {BUOYS.map((b) => (
        <Buoy key={b.id} b={b} />
      ))}
    </>
  );
}
