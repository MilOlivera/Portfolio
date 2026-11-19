"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { NAV_BUOYS, type NavBuoy } from "./waypoints-data";

// IALA Region B lateral marks along the Canal Mitre (decorative: no
// collision, no CTA). Red = can body + can topmark, green = cone topmark.
const RED = "#d9342c";
const GREEN = "#38b649";

function LateralBuoy({ b }: { b: NavBuoy }) {
  const light = useRef<MeshStandardMaterial>(null);
  const color = b.side === "red" ? RED : GREEN;

  // Slow flash, de-synced per buoy
  useFrame(({ clock }) => {
    if (!light.current) return;
    const c = (clock.elapsedTime + b.pos[0] * 0.37) % 3;
    light.current.emissiveIntensity = c < 0.6 ? 2.2 : 0.15;
  });

  return (
    <group position={b.pos}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.55, 1.1, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {b.side === "red" ? (
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.35, 10]} />
          <meshStandardMaterial color={RED} />
        </mesh>
      ) : (
        <mesh position={[0, 1.15, 0]}>
          <coneGeometry args={[0.22, 0.4, 10]} />
          <meshStandardMaterial color={GREEN} />
        </mesh>
      )}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial ref={light} color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

export default function NavBuoys() {
  return (
    <>
      {NAV_BUOYS.map((b) => (
        <LateralBuoy key={b.id} b={b} />
      ))}
    </>
  );
}
