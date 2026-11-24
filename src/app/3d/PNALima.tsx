"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, MeshStandardMaterial, PointLight } from "three";
import { BANK_Y } from "./environment";

// Prefectura Naval Argentina — station "PNA LIMA" on the west bank. Built in
// a local frame aligned with the river: local +X = downstream tangent,
// local +Z = inland, local -Z = toward the water. With
// rotation.y = atan2(-tz, tx), local +X maps to (tx, tz) and local +Z to
// (-tz, tx), which is exactly the inland direction here.
// Three.js materials can't read the site's CSS theme tokens, so the hex
// colors below are intentional (the DOM sign uses theme classes).
const ANCHOR: [number, number] = [211.0, 2151.0];
const TANGENT: [number, number] = [0.12, 0.993];
const ROT_Y = Math.atan2(-TANGENT[1], TANGENT[0]);

// Patrol boat world position (215.9, 2150.4) projected into the local frame
const BOAT_LOCAL: [number, number] = (() => {
  const dx = 215.9 - ANCHOR[0];
  const dz = 2150.4 - ANCHOR[1];
  return [dx * TANGENT[0] + dz * TANGENT[1], dx * -TANGENT[1] + dz * TANGENT[0]];
})();

const WHITE = "#f2f2ef";
const GREY = "#c4c8cc";
const DARK = "#3a3f44";
const PNA_BLUE = "#1f3f8a";
const PNA_YELLOW = "#f2c230";
const FLAG_BLUE = "#74ACDF";
const SUN = "#f6b40e";
const WOOD = "#6b5a45";

const BLD = { w: 3, h: 2, d: 2, z: 1.6 }; // long side (w) along the river
const ROOF_Y = BANK_Y + BLD.h;
const POLE_H = 5;

function Flag() {
  const flag = useRef<Group>(null);
  // Subtle sway around the pole
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (flag.current) flag.current.rotation.y = 0.18 * Math.sin(t * 1.3) + 0.06 * Math.sin(t * 3.1);
  });
  const W = 1.2;
  const S = 0.26; // stripe height
  return (
    <group position={[2.6, BANK_Y, 0.6]}>
      <mesh position={[0, POLE_H / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.06, POLE_H, 6]} />
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </mesh>
      <group ref={flag} position={[0, POLE_H - 0.1, 0]}>
        {[FLAG_BLUE, WHITE, FLAG_BLUE].map((c, i) => (
          <mesh key={i} position={[W / 2 + 0.05, -S / 2 - i * S, 0]}>
            <boxGeometry args={[W, S, 0.02]} />
            <meshStandardMaterial color={c} roughness={0.8} />
          </mesh>
        ))}
        {/* Sol de Mayo on the white stripe, both faces */}
        <mesh position={[W / 2 + 0.05, -S * 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 10]} />
          <meshStandardMaterial color={SUN} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function Strobe() {
  const mat = useRef<MeshStandardMaterial>(null);
  const light = useRef<PointLight>(null);
  // Brief double flash every 1.5 s
  useFrame(({ clock }) => {
    const p = clock.elapsedTime % 1.5;
    const on = p < 0.06 || (p > 0.16 && p < 0.22);
    if (mat.current) mat.current.emissiveIntensity = on ? 6 : 0.2;
    if (light.current) light.current.intensity = on ? 25 : 0;
  });
  return (
    <group position={[-1, ROOF_Y + 0.25, BLD.z]}>
      <mesh>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial ref={mat} color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
      </mesh>
      <pointLight ref={light} position={[0, 0.3, 0]} intensity={0} distance={8} decay={2} />
    </group>
  );
}

function Radar() {
  const bar = useRef<Group>(null);
  useFrame((_, delta) => {
    if (bar.current) bar.current.rotation.y += delta * 1.6;
  });
  return (
    <group position={[0.9, ROOF_Y, BLD.z]}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 1.5, 6]} />
        <meshStandardMaterial color={WHITE} roughness={0.5} />
      </mesh>
      <group ref={bar} position={[0, 1.55, 0]}>
        <mesh>
          <boxGeometry args={[0.9, 0.08, 0.12]} />
          <meshStandardMaterial color={DARK} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function PatrolBoat() {
  const boat = useRef<Group>(null);
  // Gentle bob at the mooring
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (boat.current) {
      boat.current.position.y = 0.03 * Math.sin(t * 1.7);
      boat.current.rotation.x = 0.025 * Math.sin(t * 1.3);
    }
  });
  const L = 1.5;
  const B = 0.5;
  return (
    <group position={[BOAT_LOCAL[0], 0, BOAT_LOCAL[1]]}>
      <group ref={boat}>
        {/* Hull, bow (local -X) pointing upstream */}
        <mesh position={[0.08, 0.08, 0]} castShadow>
          <boxGeometry args={[L - 0.16, 0.36, B]} />
          <meshStandardMaterial color={GREY} roughness={0.6} />
        </mesh>
        <mesh position={[-L / 2 + 0.08, 0.08, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[B * 0.7, 0.36, B * 0.7]} />
          <meshStandardMaterial color={GREY} roughness={0.6} />
        </mesh>
        {/* Yellow over blue stripe, both sides */}
        {[-1, 1].map((side) => (
          <group key={side} position={[0.1, 0, (side * (B + 0.01)) / 2]}>
            <mesh position={[0, 0.17, 0]}>
              <boxGeometry args={[L * 0.75, 0.05, 0.01]} />
              <meshStandardMaterial color={PNA_YELLOW} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <boxGeometry args={[L * 0.75, 0.05, 0.01]} />
              <meshStandardMaterial color={PNA_BLUE} roughness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Cabin */}
        <mesh position={[0.05, 0.42, 0]} castShadow>
          <boxGeometry args={[0.55, 0.32, 0.38]} />
          <meshStandardMaterial color={WHITE} roughness={0.5} />
        </mesh>
        <mesh position={[0.05, 0.64, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.14, 4]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      </group>
    </group>
  );
}

export default function PNALima() {
  // Small jetty from the bank out to the boat's inshore side
  const jettyEnd = BOAT_LOCAL[1] + 0.3;
  return (
    <group position={[ANCHOR[0], 0, ANCHOR[1]]} rotation={[0, ROT_Y, 0]}>
      {/* Station building: white block, blue band, dark roof slab */}
      <mesh position={[0, BANK_Y + BLD.h / 2, BLD.z]} castShadow receiveShadow>
        <boxGeometry args={[BLD.w, BLD.h, BLD.d]} />
        <meshStandardMaterial color={WHITE} roughness={0.7} />
      </mesh>
      <mesh position={[0, BANK_Y + BLD.h * 0.72, BLD.z - BLD.d / 2 - 0.005]}>
        <boxGeometry args={[BLD.w, 0.14, 0.01]} />
        <meshStandardMaterial color={PNA_BLUE} roughness={0.6} />
      </mesh>
      <mesh position={[0, ROOF_Y + 0.05, BLD.z]}>
        <boxGeometry args={[BLD.w + 0.2, 0.1, BLD.d + 0.2]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>

      <Flag />
      <Strobe />
      <Radar />

      {/* Sign board facing the river + DOM label */}
      <group position={[-2.4, BANK_Y, -0.4]}>
        {[-0.8, 0.8].map((x) => (
          <mesh key={x} position={[x, 0.45, 0]}>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        ))}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[2, 0.5, 0.06]} />
          <meshStandardMaterial color={PNA_BLUE} roughness={0.6} />
        </mesh>
        <Html position={[0, 1.05, 0]} distanceFactor={14} pointerEvents="none" zIndexRange={[5, 0]} center>
          <div className="font-mono text-xs font-bold text-text bg-black/60 px-2 py-1 whitespace-nowrap">PNA LIMA</div>
        </Html>
      </group>

      {/* Jetty to the patrol boat */}
      <mesh position={[BOAT_LOCAL[0], Math.min(0.25, BANK_Y), jettyEnd / 2]} receiveShadow>
        <boxGeometry args={[0.6, 0.1, Math.abs(jettyEnd)]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>

      <PatrolBoat />
    </group>
  );
}
