"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { BANK_Y } from "./environment";
import { VISUAL_HALF, frameAtZ, riverYaw } from "./river-geometry";
import { ESCOBAR_Z, TUGS } from "./waypoints-data";

// Puerto Escobar, west bank (the player's port side sailing down), just
// upstream of the FSRU: a short tug quay, an operations building with an
// "ESCOBAR" sign, a low stevedore crane and the 3 Svitzer tugs that assist
// the EXPEDIENT. Laid out in the river frame at ESCOBAR_Z: local +X =
// downstream, local +Z = west (toward the bank; the waterline is at z = 10).
// Three.js can't read CSS tokens → hex colors.
const CONCRETE = "#9a9a94";
const TUG_BLUE = "#1a3a5c";
const WHITE = "#f2f2f2";
const RED = "#c0392b";

const QUAY = { x: 0, z: VISUAL_HALF, len: 4, w: 2, top: 0.3 };

/** Svitzer harbour tug, ~32 m → 1.6 u. Bow = local +X, starboard = local +Z. */
function Tug({ name }: { name: string }) {
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.6]} />
        <meshStandardMaterial color={TUG_BLUE} />
      </mesh>
      <mesh position={[0.84, 0.1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.28, 0.5, 0.28]} />
        <meshStandardMaterial color={TUG_BLUE} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[1.62, 0.06, 0.62]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      {/* Tall wheelhouse with window band */}
      <mesh position={[0.15, 0.65, 0]} castShadow>
        <boxGeometry args={[0.7, 0.6, 0.5]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0.15, 0.82, 0]}>
        <boxGeometry args={[0.72, 0.12, 0.52]} />
        <meshStandardMaterial color="#1b1f22" />
      </mesh>
      {/* Funnel, red top */}
      <mesh position={[-0.35, 0.6, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.4, 10]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[-0.35, 0.83, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.07, 10]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {/* Towing bollard aft */}
      <mesh position={[-0.65, 0.42, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.18, 8]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>
      {/* Side lights: green starboard (+Z), red port (−Z) */}
      <mesh position={[0.15, 0.98, 0.27]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#38b649" emissive="#38b649" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.15, 0.98, -0.27]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={2} />
      </mesh>
      <Html position={[0, 1.35, 0]} center distanceFactor={9} pointerEvents="none" zIndexRange={[5, 0]}>
        <div className="font-mono text-[10px] font-bold whitespace-nowrap text-text">{name}</div>
      </Html>
    </group>
  );
}

export default function PuertoEscobar() {
  const frame = useMemo(() => {
    const f = frameAtZ(ESCOBAR_Z);
    return { x: f.x, z: f.z, yaw: riverYaw(ESCOBAR_Z) };
  }, []);

  return (
    <group position={[frame.x, 0, frame.z]} rotation={[0, frame.yaw, 0]}>
      {/* Tug quay (half over the water) */}
      <mesh position={[QUAY.x, (QUAY.top - 0.5) / 2, QUAY.z]} castShadow receiveShadow>
        <boxGeometry args={[QUAY.len, QUAY.top + 0.5, QUAY.w]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>

      {/* Tugs alongside, bows alternating */}
      {TUGS.map((t) => (
        <group key={t.name} position={[t.along, 0, t.west]} rotation={[0, t.bowUpstream ? Math.PI : 0, 0]}>
          <Tug name={t.name} />
        </group>
      ))}

      {/* Operations building + ESCOBAR sign */}
      <group position={[-0.5, BANK_Y, QUAY.z + 3]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[2, 1.5, 1.2]} />
          <meshStandardMaterial color={WHITE} />
        </mesh>
        <mesh position={[0, 1.55, 0]}>
          <boxGeometry args={[2.1, 0.1, 1.3]} />
          <meshStandardMaterial color="#5a6670" />
        </mesh>
        <Html position={[0, 2.2, 0]} center distanceFactor={12} pointerEvents="none" zIndexRange={[5, 0]}>
          <div className="border border-text/40 bg-black/60 px-2 py-0.5 font-mono text-xs font-bold tracking-widest whitespace-nowrap text-text">
            ESCOBAR
          </div>
        </Html>
      </group>

      {/* Low stevedore crane silhouette on the quay */}
      <group position={[1.4, QUAY.top, QUAY.z + 0.3]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.15, 2, 0.15]} />
          <meshStandardMaterial color="#d4a017" />
        </mesh>
        <mesh position={[0, 2, -0.9]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 2.2]} />
          <meshStandardMaterial color="#d4a017" />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.6]} />
          <meshStandardMaterial color="#5a6670" />
        </mesh>
      </group>
    </group>
  );
}
