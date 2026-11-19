"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { WAYPOINTS, type Waypoint } from "./waypoints-data";

export { WAYPOINTS } from "./waypoints-data";

// Labels are DOM, so they use the theme tokens (text-warn / text-phosphor /
// text-green). They never take pointer events (OrbitControls in V view) and
// sit below the HUD (z-10) instead of drei's default huge z-index.
const LABEL_PROPS = { pointerEvents: "none" as const, zIndexRange: [5, 0] };

function Buoy({ w }: { w: Waypoint }) {
  const mat = useRef<MeshStandardMaterial>(null);
  const base = w.dim ? 0.3 : 0.8;

  useFrame(({ clock }) => {
    if (!w.pulse || !mat.current) return;
    const t = (Math.sin(clock.elapsedTime * 2.5 + w.pos[0]) + 1) / 2; // 0..1, de-synced per buoy
    mat.current.emissiveIntensity = base * (0.4 + 0.9 * t);
  });

  return (
    <group position={w.pos}>
      <mesh castShadow>
        <cylinderGeometry args={[0.6, 0.8, 1.5, 12]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial ref={mat} color={w.color} emissive={w.color} emissiveIntensity={base} />
      </mesh>
      <Html position={[0, 2.2, 0]} center distanceFactor={15} {...LABEL_PROPS}>
        <div className={`font-mono text-xs whitespace-nowrap text-warn ${w.dim ? "opacity-60" : ""}`}>
          {w.title}
        </div>
      </Html>
    </group>
  );
}

function ClientShip({ w }: { w: Waypoint }) {
  return (
    <group position={w.pos} rotation={[0, w.rotation ?? 0, 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[6, 1, 1.2]} />
        <meshStandardMaterial color="#1a4a30" />
      </mesh>
      <mesh position={[-2, 1.2, 0]} castShadow>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[5.5, 0.05, 0.3]} />
        <meshStandardMaterial color="#FFB020" />
      </mesh>
      <Html position={[0, 3, 0]} center distanceFactor={20} {...LABEL_PROPS}>
        <div className="border border-phosphor bg-black/70 px-2 py-1 font-mono text-sm font-bold whitespace-nowrap text-phosphor">
          {w.title}
        </div>
      </Html>
    </group>
  );
}

const CONTAINERS: [number, string][] = [
  [-3, "#00FF88"],
  [-1, "#FFB020"],
  [1, "#FFFFFF"],
  [3, "#00FF88"],
  [5, "#FFB020"],
];

function MegaShip({ w }: { w: Waypoint }) {
  return (
    <group position={w.pos} rotation={[0, w.rotation ?? 0, 0]}>
      {/* Hull, twice the size */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[14, 2, 2.4]} />
        <meshStandardMaterial color="#1a7a40" emissive="#25DB79" emissiveIntensity={0.15} />
      </mesh>
      {/* Bridge + red roof */}
      <mesh position={[-5, 2.5, 0]} castShadow>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-5, 3.6, 0]}>
        <boxGeometry args={[3.2, 0.2, 2.2]} />
        <meshStandardMaterial color="#AA2222" />
      </mesh>
      {/* Deck containers */}
      {CONTAINERS.map(([x, color]) => (
        <mesh key={x} position={[x, 2.3, 0]} castShadow>
          <boxGeometry args={[1.6, 0.8, 1.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {/* Foremast + masthead light */}
      <mesh position={[6.5, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[6.5, 5.5, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1} />
      </mesh>
      {/* Green aura (no depth write so it never hides what's behind it) */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[12, 24, 24]} />
        <meshBasicMaterial color="#25DB79" opacity={0.08} transparent depthWrite={false} />
      </mesh>
      <Html position={[0, 7, 0]} center distanceFactor={25} {...LABEL_PROPS}>
        <div className="font-mono text-xl font-extrabold whitespace-nowrap text-green [text-shadow:0_0_20px_var(--green)]">
          ◉ EVOLVERE
        </div>
      </Html>
    </group>
  );
}

export default function Waypoints() {
  return (
    <>
      {WAYPOINTS.map((w) => {
        if (w.kind === "buoy") return <Buoy key={w.id} w={w} />;
        if (w.kind === "ship") return <ClientShip key={w.id} w={w} />;
        return <MegaShip key={w.id} w={w} />;
      })}
    </>
  );
}
