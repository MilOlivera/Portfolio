"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { NAV_BUOYS, type NavBuoy } from "./nav-buoys";

// Navigation buoys (decorative: no collision, no CTA).
//  red    — can body + can topmark (IALA lateral)
//  green  — cone topmark (IALA lateral); the km 98 turning buoy is one of these
//  yellow — special mark, St Andrew's cross topmark (GNL turning area)
const RED = "#d9342c";
const GREEN = "#38b649";
const YELLOW = "#F7D417";
const COLOR = { red: RED, green: GREEN, yellow: YELLOW } as const;
// Modelled ~1.7 u tall; scaled so a buoy reads clearly but stays smaller than
// the 80 m tanker (1 u = 20 m).
const BUOY_SCALE = 0.6;

export function Buoy({ b }: { b: NavBuoy }) {
  const light = useRef<MeshStandardMaterial>(null);
  const color = COLOR[b.kind];

  // Flash, de-synced per buoy (yellow: slower pulse)
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.elapsedTime + b.pos[0] * 0.37 + b.pos[2] * 0.011;
    const pulse = (rad: number) => 0.4 + 1.8 * ((Math.sin(rad) + 1) / 2);
    light.current.emissiveIntensity = b.pulseHz
      ? pulse(t * b.pulseHz * Math.PI * 2)
      : b.kind === "yellow"
        ? pulse(t * 2.2)
        : t % 3 < 0.6
          ? 2.2
          : 0.15;
  });

  return (
    <group position={b.pos}>
      <group scale={BUOY_SCALE}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.55, 1.1, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {b.kind === "red" && (
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.35, 10]} />
            <meshStandardMaterial color={RED} />
          </mesh>
        )}
        {b.kind === "green" && (
          <mesh position={[0, 1.15, 0]}>
            <coneGeometry args={[0.22, 0.4, 10]} />
            <meshStandardMaterial color={GREEN} />
          </mesh>
        )}
        {b.kind === "yellow" &&
          [Math.PI / 4, -Math.PI / 4].map((r) => (
            <mesh key={r} position={[0, 1.15, 0]} rotation={[0, 0, r]}>
              <boxGeometry args={[0.5, 0.07, 0.07]} />
              <meshStandardMaterial color={YELLOW} />
            </mesh>
          ))}
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial ref={light} color={color} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      </group>
      {b.label && (
        <Html position={[0, 1.6, 0]} center distanceFactor={14} pointerEvents="none" zIndexRange={[5, 0]}>
          <div className="rounded border border-green/70 bg-black/60 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-green">
            ▲ {b.label}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function NavBuoys() {
  return (
    <>
      {NAV_BUOYS.map((b) => (
        <Buoy key={b.id} b={b} />
      ))}
    </>
  );
}
