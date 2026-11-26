"use client";

import { Html } from "@react-three/drei";
import { Buoy } from "./NavBuoys";
import type { NavBuoy } from "./nav-buoys";

// Puerto La Plata, at the end of Canal Brown past the Zona Común. Its
// signature: four malecón beacons (2 red + 2 green, alternating) bunched in a
// straight line marking the entrance, and TEC PLATA at the head of it. The
// port cranes and city behind are LaPlataSkyline (see Relocated.tsx).
// Scenery only. Three.js can't read the CSS theme tokens → hex colors.
const START: [number, number] = [144, 552];
const TEC: [number, number] = [160, 573];
const SPACING = 1.5;
const LEN = Math.hypot(TEC[0] - START[0], TEC[1] - START[1]);
const DIR: [number, number] = [(TEC[0] - START[0]) / LEN, (TEC[1] - START[1]) / LEN];
/** rotation.y that turns local −Z toward the approaching boat. */
const FACING = Math.atan2(DIR[0], DIR[1]);

const MALECONES: NavBuoy[] = (["red", "green", "red", "green"] as const).map((kind, i) => ({
  id: `malecon-${i}`,
  kind,
  pos: [START[0] + DIR[0] * SPACING * i, 0, START[1] + DIR[1] * SPACING * i],
  label: i === 0 ? "MALECONES · KM 8.7" : undefined,
}));

const BEIGE = "#c8b998";
const BEIGE_DARK = "#a89a7c";
const GREY = "#8c8f93";
const WINDOW = "#ffc46b";
const CONCRETE = "#9a968d";
const CRANE = "#c8402f";

function TecPlata() {
  return (
    <group position={[TEC[0], 0, TEC[1]]} rotation={[0, FACING, 0]}>
      {/* Quay (the building stands over the shallows) */}
      <mesh position={[0, 0.05, 1]} receiveShadow>
        <boxGeometry args={[16, 0.5, 9]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.3, 2]} castShadow>
        <boxGeometry args={[10, 4, 4]} />
        <meshStandardMaterial color={BEIGE} roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.45, 2]}>
        <boxGeometry args={[10.3, 0.3, 4.3]} />
        <meshStandardMaterial color={GREY} />
      </mesh>
      <mesh position={[6, 3.3, 2]} castShadow>
        <boxGeometry args={[2, 6, 3]} />
        <meshStandardMaterial color={BEIGE_DARK} roughness={0.85} />
      </mesh>
      {[-3.5, -1.75, 0, 1.75, 3.5].map((x) => (
        <mesh key={x} position={[x, 2.6, -0.02]}>
          <boxGeometry args={[1, 0.6, 0.05]} />
          <meshStandardMaterial color={WINDOW} emissive={WINDOW} emissiveIntensity={1.2} />
        </mesh>
      ))}
      {/* Two portal cranes behind */}
      {[-6, 3].map((x) => (
        <group key={x} position={[x, 0, 5]}>
          {[-1, 1].map((dx) => (
            <mesh key={dx} position={[dx, 4.3, 0]} castShadow>
              <boxGeometry args={[0.35, 8, 0.35]} />
              <meshStandardMaterial color={CRANE} />
            </mesh>
          ))}
          <mesh position={[0, 8.5, -1.5]}>
            <boxGeometry args={[2.6, 0.45, 6]} />
            <meshStandardMaterial color={CRANE} />
          </mesh>
        </group>
      ))}
      <Html position={[0, 6.4, 0]} center distanceFactor={26} pointerEvents="none" zIndexRange={[5, 0]}>
        <div className="rounded border border-border-strong bg-black/70 px-2 py-1 text-center font-mono whitespace-nowrap text-text">
          <div className="text-sm font-bold tracking-[0.2em]">TEC PLATA</div>
          <div className="text-[10px] opacity-75">Puerto La Plata</div>
        </div>
      </Html>
    </group>
  );
}

export default function PuertoLaPlata() {
  return (
    <>
      {MALECONES.map((b) => (
        <Buoy key={b.id} b={b} />
      ))}
      <TecPlata />
    </>
  );
}
