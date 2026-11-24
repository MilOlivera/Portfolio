"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { BANK_Y } from "./environment";
import { frameAtZ, riverYaw } from "./river-geometry";
import { ESCOBAR_Z, TUGS } from "./waypoints-data";

// Puerto Escobar, west bank (the player's port side sailing down), just
// upstream of the FSRU. The real port is modest: a low concrete quay for the
// tugs, two low corrugated sheds (tinglados) with gable roofs, a low reach
// stacker, a small office hut and a modest sign — no tall buildings or big
// port cranes. Laid out in the river frame at ESCOBAR_Z: local +X =
// downstream, local +Z = west (toward the bank; the waterline is at z = 10).
// Three.js can't read CSS tokens → hex colors.
const CONCRETE = "#a7a7a0";
const TUG_BLUE = "#1a3a5c";
const WHITE = "#f2f2f2";
const RED = "#c0392b";
const SHED_COLOR = "#b9b3a2";
const ROOF = "#5a3d2b";
const DOOR = "#3d4247";
const YELLOW = "#d4a017";

// Quay 6 long × 3 wide × 0.4 high, half over the water (z 8.5–11.5)
const QUAY = { len: 6, w: 3, z: 10, top: 0.3 };
const SHEDS_X = [-2.2, 2.2];
const SHED = { w: 3, h: 2, d: 4, z: 14.5 };

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

/** Corrugated shed with a gable roof; door faces the river (local −Z). */
function Shed({ x }: { x: number }) {
  const pitch = 0.42;
  const half = SHED.w / 2;
  const slope = half / Math.cos(pitch) + 0.1;
  return (
    <group position={[x, BANK_Y, SHED.z]}>
      <mesh position={[0, SHED.h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[SHED.w, SHED.h, SHED.d]} />
        <meshStandardMaterial color={SHED_COLOR} roughness={0.8} metalness={0.2} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[(side * half) / 2, SHED.h + Math.tan(pitch) * (half / 2), 0]}
          rotation={[0, 0, -side * pitch]}
          castShadow
        >
          <boxGeometry args={[slope, 0.08, SHED.d + 0.2]} />
          <meshStandardMaterial color={ROOF} roughness={0.7} />
        </mesh>
      ))}
      {/* Big sliding door toward the river */}
      <mesh position={[0, 0.75, -SHED.d / 2 - 0.02]}>
        <boxGeometry args={[1.7, 1.5, 0.04]} />
        <meshStandardMaterial color={DOOR} />
      </mesh>
    </group>
  );
}

/** Low reach stacker on the quay: yellow chassis + 2-segment telescopic boom (max ~3 u). */
function ReachStacker() {
  return (
    <group position={[1.4, QUAY.top, QUAY.z + 0.4]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>
      <mesh position={[0.2, 0.7, 0.25]}>
        <boxGeometry args={[0.45, 0.4, 0.4]} />
        <meshStandardMaterial color="#2b2f33" />
      </mesh>
      {/* boom: rises toward the water (−Z) to ~2.9 u */}
      <mesh position={[-0.2, 1.5, -0.6]} rotation={[0.7, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 2.2, 8]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>
      <mesh position={[-0.2, 2.35, -1.55]} rotation={[1.1, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 1.1, 8]} />
        <meshStandardMaterial color={YELLOW} />
      </mesh>
      <mesh position={[-0.2, 2.55, -2.05]}>
        <boxGeometry args={[0.6, 0.12, 0.2]} />
        <meshStandardMaterial color="#2b2f33" />
      </mesh>
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
      {/* Low concrete quay (half over the water) + small bollards every 1 u */}
      <mesh position={[0, (QUAY.top - 0.5) / 2, QUAY.z]} castShadow receiveShadow>
        <boxGeometry args={[QUAY.len, QUAY.top + 0.5, QUAY.w]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => (
        <mesh key={x} position={[x, QUAY.top + 0.06, QUAY.z - QUAY.w / 2 + 0.15]}>
          <cylinderGeometry args={[0.05, 0.06, 0.12, 8]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      ))}

      {/* Tugs alongside, bows alternating */}
      {TUGS.map((t) => (
        <group key={t.name} position={[t.along, 0, t.west]} rotation={[0, t.bowUpstream ? Math.PI : 0, 0]}>
          <Tug name={t.name} />
        </group>
      ))}

      {SHEDS_X.map((x) => (
        <Shed key={x} x={x} />
      ))}
      <ReachStacker />

      {/* Office hut + antenna */}
      <group position={[5, BANK_Y, 13]}>
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[1.5, 1.8, 1.5]} />
          <meshStandardMaterial color={WHITE} />
        </mesh>
        <mesh position={[0, 1.1, -0.76]}>
          <boxGeometry args={[1, 0.45, 0.02]} />
          <meshStandardMaterial color="#1b2a44" />
        </mesh>
        <mesh position={[0.5, 2.3, 0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
          <meshStandardMaterial color="#8a8f92" />
        </mesh>
      </group>

      {/* Modest sign, 1.5 u above the sheds */}
      <Html position={[0, BANK_Y + SHED.h + 1.5, SHED.z]} center distanceFactor={12} pointerEvents="none" zIndexRange={[5, 0]}>
        <div className="font-mono text-xs font-bold tracking-[0.25em] whitespace-nowrap text-green/70">
          PUERTO ESCOBAR
        </div>
      </Html>
    </group>
  );
}
