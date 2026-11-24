"use client";

import { useMemo } from "react";
import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import { BANK_Y } from "./environment";
import { FSRU } from "./waypoints-data";

// GNL Escobar jetty around the FSRU EXPEDIENT (FSRUExpedient.tsx): 4 mooring
// dolphins with lines to the hull, a central loading tower with 4 articulated
// LNG arms, an elevated platform on concrete piles at the bank, and 3 shore
// storage spheres. Everything is laid out in the FSRU's own frame (local +X =
// its bow, upstream; local −Z = its port side = the jetty/bank), so it all
// moves with FSRU.pos / FSRU.yaw. The 4 yellow safety buoys are nav-buoys.ts.
// Three.js can't read CSS tokens → hex colors.
const CONCRETE = "#9a9a94";
const STEEL = "#b8bfc3";
const WHITE = "#f2f2f2";
const RED = "#c0392b";
const ROPE = "#d8c9a3";

const DOLPHINS: [number, number][] = [
  [7.5, -1.9], // bow, jetty side
  [7.5, 1.9], // bow, outboard
  [-7.5, -1.9], // stern, jetty side
  [-7.5, 1.9], // stern, outboard
];
const DOLPHIN_TOP = 1.2;
const PLATFORM = { x: 0, z: -3.6, w: 8, d: 2, top: 0.8 }; // local, at the bank
const TOWER = { x: 0, z: -2.9, h: 4 };
const ARMS_X = [-1.2, -0.4, 0.4, 1.2];
const TANKS_X = [-8, 0, 8];
const TANK_Z = -9;
const TANK_D = 3;

function buildMooringLines() {
  // From each dolphin bollard to the nearest hull fairlead (deck edge)
  const pts: number[] = [];
  for (const [x, z] of DOLPHINS) {
    const hullX = Math.sign(x) * 6.5;
    const hullZ = Math.sign(z) * 1.1;
    for (const dx of [0, -Math.sign(x) * 0.8]) pts.push(x, DOLPHIN_TOP + 0.1, z, hullX + dx, 0.95, hullZ);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return geo;
}

/** L-shaped articulated arm: riser on the tower, boom out, drop to the manifold. */
function LoadingArm({ x }: { x: number }) {
  const base = new Vector3(x, PLATFORM.top, TOWER.z);
  const top = TOWER.h - 0.4;
  const reach = -1.1 - 0.32 - TOWER.z; // out to the FSRU manifold (local z ≈ −1.42)
  return (
    <group position={base}>
      <mesh position={[0, (top - PLATFORM.top) / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.06, top - PLATFORM.top, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, top - PLATFORM.top, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      <mesh position={[0, top - PLATFORM.top, reach / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, reach, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, top - PLATFORM.top, reach]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      <mesh position={[0, (top + 1.1) / 2 - PLATFORM.top, reach]}>
        <cylinderGeometry args={[0.045, 0.045, top - 1.1, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
    </group>
  );
}

export default function GNLEscobar() {
  const lines = useMemo(buildMooringLines, []);

  return (
    <group position={FSRU.pos} rotation={[0, FSRU.yaw, 0]}>
      {/* Mooring dolphins + bollards */}
      {DOLPHINS.map(([x, z]) => (
        <group key={`${x},${z}`} position={[x, 0, z]}>
          <mesh position={[0, (DOLPHIN_TOP - 0.6) / 2, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.45, DOLPHIN_TOP + 0.6, 12]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.9} />
          </mesh>
          <mesh position={[0, DOLPHIN_TOP + 0.08, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.16, 8]} />
            <meshStandardMaterial color="#2b2b2b" />
          </mesh>
        </group>
      ))}
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={ROPE} />
      </lineSegments>

      {/* Elevated platform on concrete piles at the bank */}
      <mesh position={[PLATFORM.x, PLATFORM.top - 0.1, PLATFORM.z]} castShadow receiveShadow>
        <boxGeometry args={[PLATFORM.w, 0.2, PLATFORM.d]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      {[-3.5, -1.2, 1.2, 3.5].flatMap((x) =>
        [-0.8, 0.8].map((dz) => (
          <mesh key={`${x},${dz}`} position={[x, (PLATFORM.top - 0.8) / 2, PLATFORM.z + dz]}>
            <cylinderGeometry args={[0.12, 0.12, PLATFORM.top + 0.8, 8]} />
            <meshStandardMaterial color={CONCRETE} />
          </mesh>
        )),
      )}

      {/* Loading tower (steel lattice silhouette) + 4 LNG arms */}
      <group position={[TOWER.x, PLATFORM.top, TOWER.z]}>
        {[-0.35, 0.35].flatMap((dx) =>
          [-0.35, 0.35].map((dz) => (
            <mesh key={`${dx},${dz}`} position={[dx, (TOWER.h - PLATFORM.top) / 2, dz]}>
              <boxGeometry args={[0.08, TOWER.h - PLATFORM.top, 0.08]} />
              <meshStandardMaterial color={STEEL} />
            </mesh>
          )),
        )}
        {[1, 2, 3].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[0.8, 0.06, 0.8]} />
            <meshStandardMaterial color={STEEL} />
          </mesh>
        ))}
      </group>
      {ARMS_X.map((x) => (
        <LoadingArm key={x} x={x} />
      ))}

      {/* Pipe rack from the platform to the shore tanks */}
      <mesh position={[0, 0.5 + BANK_Y, (PLATFORM.z + TANK_Z) / 2]}>
        <boxGeometry args={[0.25, 0.25, Math.abs(TANK_Z - PLATFORM.z)]} />
        <meshStandardMaterial color={STEEL} />
      </mesh>

      {/* Shore storage spheres */}
      {TANKS_X.map((x) => (
        <group key={x} position={[x, BANK_Y, TANK_Z]}>
          <mesh position={[0, TANK_D / 2 + 0.5, 0]} castShadow>
            <sphereGeometry args={[TANK_D / 2, 20, 14]} />
            <meshStandardMaterial color={WHITE} roughness={0.5} />
          </mesh>
          <mesh position={[0, TANK_D / 2 + 0.5, 0]}>
            <torusGeometry args={[TANK_D / 2 + 0.01, 0.03, 6, 32]} />
            <meshStandardMaterial color="#8a8f92" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh key={i} position={[Math.cos((i * Math.PI) / 2) * 1.1, 0.5, Math.sin((i * Math.PI) / 2) * 1.1]}>
              <cylinderGeometry args={[0.07, 0.07, 1.1, 6]} />
              <meshStandardMaterial color="#8a8f92" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
