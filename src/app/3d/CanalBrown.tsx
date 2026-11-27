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
const TO_Z = 786; // up to the TEC PLATA quay
// Five pairs evenly spaced from the Brown entrance to the Zona Común
const PAIRS = 5;
const PAIRS_FROM_Z = 490;
const PAIRS_TO_Z = 650;
const PAIRS_Z = Array.from({ length: PAIRS }, (_, i) => PAIRS_FROM_Z + (i * (PAIRS_TO_Z - PAIRS_FROM_Z)) / (PAIRS - 1));
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
