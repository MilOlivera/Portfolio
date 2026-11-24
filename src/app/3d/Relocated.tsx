"use client";

import type { ReactNode } from "react";
import Aeroparque from "./Aeroparque";
import GrainTerminal from "./GrainTerminal";
import LaPlataSkyline from "./LaPlataSkyline";
import PNALima from "./PNALima";
import { besideRiver, riverYaw } from "./river-geometry";

// These landmarks were modelled in absolute world coordinates for the
// uncompressed route (3D-4b.3). Rather than re-authoring them, each is moved
// rigidly from its old anchor to the matching spot on the compressed river:
// rotate by the change in river heading, then translate. Same offset from the
// bank as before (adjusted for the 20 u visible river / 40 u estuary).
type Anchor = { x: number; z: number; yaw: number };

function Relocate({ from, to, children }: { from: Anchor; to: Anchor; children: ReactNode }) {
  return (
    <group position={[to.x, 0, to.z]} rotation={[0, to.yaw - from.yaw, 0]}>
      <group position={[-from.x, 0, -from.z]}>{children}</group>
    </group>
  );
}

function anchorAt(z: number, westOffset: number): Anchor {
  const [x, az] = besideRiver(z, westOffset);
  return { x, z: az, yaw: riverYaw(z) };
}

// old anchor (x, z) + river yaw there (atan2(-tz, tx) of the old tangent)
const OLD = {
  lima: { x: 211.0, z: 2151.0, yaw: Math.atan2(-0.993, 0.12) },
  grain: { x: 115.4, z: 1501.6, yaw: Math.atan2(-0.986, 0.164) },
  aero: { x: 439.3, z: 4133.4, yaw: Math.atan2(-0.987, 0.158) },
  laPlata: { x: 547.8, z: 4798.0, yaw: Math.atan2(-0.98, 0.2) },
};

const NEW = {
  lima: anchorAt(250, 13.5), // patrol boat ends ~0.8 u inside the waterline
  grain: anchorAt(228, 15.5), // pier reaches the visible river's edge
  aero: anchorAt(395, 55), // runway 15 u inland of the estuary coast (40 u)
  laPlata: anchorAt(477, 60), // cranes on the estuary coast
};

export default function RelocatedLandmarks() {
  return (
    <>
      <Relocate from={OLD.lima} to={NEW.lima}>
        <PNALima />
      </Relocate>
      <Relocate from={OLD.grain} to={NEW.grain}>
        <GrainTerminal />
      </Relocate>
      <Relocate from={OLD.aero} to={NEW.aero}>
        <Aeroparque />
      </Relocate>
      <Relocate from={OLD.laPlata} to={NEW.laPlata}>
        <LaPlataSkyline />
      </Relocate>
    </>
  );
}
