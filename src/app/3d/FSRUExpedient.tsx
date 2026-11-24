"use client";

import { useEffect, useState } from "react";
import { FSRU, OPEN_WAYPOINT_EVENT } from "./waypoints-data";

// EXCELERATE EXPEDIENT (IMO 9389643) — FSRU permanently moored at the GNL
// Escobar jetty. 280 × 44 m → 14 × 2.2 u; draft 11 m → 0.55 u below water.
// Membrane-type LNG tanks (flat trunk decks with low domes), NOT Moss spheres.
// Bow upstream; port side (west) to the jetty. Three.js can't read CSS tokens
// → hex colors. Clicking it opens the technical modal (AlTravesDetector).

const HULL_RED = "#7a1515";
const WHITE = "#f2f2f2";
const TANK = "#cfd4d2";
const DARK = "#1b1f22";
const RED_JOINT = "#c0392b";

const LENGTH = 14;
const BEAM = 2.2;
const DRAFT = 0.55;
const FREEBOARD = 0.95; // deck height above water
const HULL_H = DRAFT + FREEBOARD;
const TANKS_X = [4.2, 1.2, -1.8, -4.8]; // along the hull (+X = bow)

export default function FSRUExpedient() {
  const [hover, setHover] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  return (
    <group
      position={FSRU.pos}
      rotation={[0, FSRU.yaw, 0]}
      onClick={(e) => {
        e.stopPropagation();
        window.dispatchEvent(new CustomEvent(OPEN_WAYPOINT_EVENT, { detail: FSRU.id }));
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      {/* Hull + white band at mid-freeboard */}
      <mesh position={[0, HULL_H / 2 - DRAFT, 0]} castShadow receiveShadow>
        <boxGeometry args={[LENGTH, HULL_H, BEAM]} />
        <meshStandardMaterial color={HULL_RED} roughness={0.7} />
      </mesh>
      {/* Raked bow */}
      <mesh position={[LENGTH / 2 + 0.45, HULL_H / 2 - DRAFT + 0.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1.27, HULL_H - 0.2, 1.27]} />
        <meshStandardMaterial color={HULL_RED} roughness={0.7} />
      </mesh>
      <mesh position={[0, FREEBOARD * 0.55, 0]}>
        <boxGeometry args={[LENGTH + 0.02, 0.12, BEAM + 0.02]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>

      {/* 4 membrane tank trunks with low domes */}
      {TANKS_X.map((x) => (
        <group key={x} position={[x, FREEBOARD, 0]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[2.6, 0.5, 1.8]} />
            <meshStandardMaterial color={TANK} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.5, 0]} scale={[1, 0.4, 0.7]} castShadow>
            <sphereGeometry args={[0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={TANK} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Regasification modules (midship, starboard) */}
      <mesh position={[-0.3, FREEBOARD + 0.35, 0.75]}>
        <boxGeometry args={[1.6, 0.7, 0.5]} />
        <meshStandardMaterial color="#9aa3a8" />
      </mesh>

      {/* Accommodation block aft (+ windows) and regas stack */}
      <group position={[-LENGTH / 2 + 1, FREEBOARD, 0]}>
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[2, 1.5, 1.8]} />
          <meshStandardMaterial color={WHITE} />
        </mesh>
        {[1.01, -1.01].map((dx) => (
          <mesh key={dx} position={[dx, 1.15, 0]}>
            <boxGeometry args={[0.02, 0.18, 1.5]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        ))}
        <mesh position={[-0.4, 1.5 + 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2.5, 10]} />
          <meshStandardMaterial color={WHITE} />
        </mesh>
        <mesh position={[-0.4, 1.5 + 2.45, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.12, 10]} />
          <meshStandardMaterial color={DARK} />
        </mesh>
      </group>

      {/* Manifold + 4 ship-side loading connections, port side (−Z local = west, the jetty) */}
      {[-1.2, -0.4, 0.4, 1.2].map((x) => (
        <group key={x} position={[x, FREEBOARD + 0.15, -BEAM / 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.15]}>
            <cylinderGeometry args={[0.07, 0.07, 0.3, 8]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 0, -0.32]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color={RED_JOINT} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
