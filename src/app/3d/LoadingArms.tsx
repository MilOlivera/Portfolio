"use client";

import { useEffect, useState } from "react";
import { Quaternion, Vector3 } from "three";
import { UNMOOR_EVENT } from "./BoatTelemetry";
import { JETTY_TOP } from "./environment";
import { JETTY } from "./river-geometry";
import { BERTH, WAYPOINTS } from "./waypoints-data";

// Yellow articulated cargo arms: one from the quay to the middle of each ship
// alongside at Campana. The B/T NANY's is disconnected when she casts off.
const YELLOW = "#f4c430";
const ELBOW_Y = JETTY_TOP + 1.1;
const NANY_ELBOW_Y = JETTY_TOP + 0.35; // low, so it doesn't fill the bridge view
const NANY_DECK_Y = 0.42;
const MOORED_DECK_Y = 0.6;
const THICK = 0.09;
const NANY_THICK = 0.045; // seen from a few metres away
const UP = new Vector3(0, 1, 0);

type V3 = [number, number, number];

function Segment({ from, to, thick }: { from: V3; to: V3; thick: number }) {
  const a = new Vector3(...from);
  const dir = new Vector3(...to).sub(a);
  const length = dir.length();
  const mid = a.addScaledVector(dir, 0.5);
  return (
    <mesh position={mid} quaternion={new Quaternion().setFromUnitVectors(UP, dir.normalize())} castShadow>
      <cylinderGeometry args={[thick, thick, length, 8]} />
      <meshStandardMaterial color={YELLOW} />
    </mesh>
  );
}

/** Riser on the quay → elbow → down onto the deck at hull center (x, z). */
function Arm({
  x,
  z,
  deckY,
  elbowY = ELBOW_Y,
  thick = THICK,
}: {
  x: number;
  z: number;
  deckY: number;
  elbowY?: number;
  thick?: number;
}) {
  const base: V3 = [JETTY.maxX - 0.5, JETTY_TOP, z];
  const elbow: V3 = [JETTY.maxX + 0.05, elbowY, z];
  const tip: V3 = [x, deckY, z];
  return (
    <group>
      <Segment from={base} to={elbow} thick={thick} />
      <Segment from={elbow} to={tip} thick={thick} />
      {[base, elbow, tip].map((p) => (
        <mesh key={p.join()} position={p}>
          <sphereGeometry args={[thick * 1.7, 8, 6]} />
          <meshStandardMaterial color={YELLOW} />
        </mesh>
      ))}
    </group>
  );
}

const MOORED = WAYPOINTS.filter((w) => w.kind === "moored-ship");

export default function LoadingArms() {
  const [loading, setLoading] = useState(true); // the NANY is still connected

  useEffect(() => {
    const onUnmoor = () => setLoading(false);
    window.addEventListener(UNMOOR_EVENT, onUnmoor);
    return () => window.removeEventListener(UNMOOR_EVENT, onUnmoor);
  }, []);

  return (
    <>
      {MOORED.map((w) => (
        <Arm key={w.id} x={w.pos[0]} z={w.pos[2]} deckY={MOORED_DECK_Y} />
      ))}
      {loading && (
        <Arm x={BERTH[0]} z={BERTH[2]} deckY={NANY_DECK_Y} elbowY={NANY_ELBOW_Y} thick={NANY_THICK} />
      )}
    </>
  );
}
