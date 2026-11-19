"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { MeshStandardMaterial } from "three";
import { WAYPOINTS, type Waypoint } from "./waypoints-data";

// Labels are DOM, so they use the theme tokens. They never take pointer
// events (OrbitControls in V view) and stay below the HUD (z-10) instead of
// drei's default huge z-index.
const LABEL_PROPS = { pointerEvents: "none" as const, zIndexRange: [5, 0], center: true };

function Label({
  y,
  w,
  className,
  distanceFactor = 20,
}: {
  y: number;
  w: Waypoint;
  className: string;
  distanceFactor?: number;
}) {
  return (
    <Html position={[0, y, 0]} distanceFactor={distanceFactor} {...LABEL_PROPS}>
      <div className={`text-center font-mono whitespace-nowrap ${className}`}>
        <div className={w.struck ? "line-through decoration-2" : undefined}>{w.title}</div>
        {w.subtitle && <div className="mt-0.5 text-[10px] font-normal opacity-75">{w.subtitle}</div>}
      </div>
    </Html>
  );
}

// ------------------------------------------------------------- landmark ----
// Low block sized to its collision circle (square side ≈ 1.4 r fits inside it).
function Landmark({ w }: { w: Waypoint }) {
  const side = w.collisionRadius * 1.4;
  const height = 1.5 + w.collisionRadius * 0.15;
  return (
    <group position={w.pos}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[side, height, side]} />
        <meshStandardMaterial color={w.color ?? "#b8a586"} roughness={0.9} />
      </mesh>
      <Label
        y={height + 2.5}
        w={w}
        className={`bg-black/60 px-2 py-1 text-xs font-bold ${w.struck ? "text-warn" : "text-text"}`}
      />
    </group>
  );
}

// ----------------------------------------------------------------- buoy ----
function Buoy({ w }: { w: Waypoint }) {
  const mat = useRef<MeshStandardMaterial>(null);
  const base = w.dim ? 0.3 : 0.8;
  const color = w.color ?? "#FFB020";

  useFrame(({ clock }) => {
    if (!w.pulse || !mat.current) return;
    const t = (Math.sin(clock.elapsedTime * 2.5 + w.pos[0]) + 1) / 2; // de-synced per buoy
    mat.current.emissiveIntensity = base * (0.4 + 0.9 * t);
  });

  return (
    <group position={w.pos}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 1.5, 12]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={base} />
      </mesh>
      <Label y={3} w={w} className={`text-xs text-warn ${w.dim ? "opacity-60" : ""}`} />
    </group>
  );
}

// ----------------------------------------------------------------- ship ----
function ShipHull({ ghost = false }: { ghost?: boolean }) {
  const mat = ghost ? { transparent: true, opacity: 0.45 } : {};
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow={!ghost}>
        <boxGeometry args={[6, 1, 1.2]} />
        <meshStandardMaterial color={ghost ? "#555555" : "#1a4a30"} {...mat} />
      </mesh>
      <mesh position={[-2, 1.5, 0]} castShadow={!ghost}>
        <boxGeometry args={[1.5, 1, 1]} />
        <meshStandardMaterial color={ghost ? "#999999" : "#FFFFFF"} {...mat} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[5.5, 0.05, 0.3]} />
        <meshStandardMaterial color={ghost ? "#777777" : "#FFB020"} {...mat} />
      </mesh>
    </>
  );
}

function Rotated({ w, children }: { w: Waypoint; children: ReactNode }) {
  return (
    <group position={w.pos} rotation={[0, w.rotation ?? 0, 0]}>
      {children}
    </group>
  );
}

function ClientShip({ w }: { w: Waypoint }) {
  return (
    <Rotated w={w}>
      <ShipHull />
      <Label
        y={3}
        w={w}
        className="border border-phosphor bg-black/70 px-2 py-1 text-sm font-bold text-phosphor"
      />
    </Rotated>
  );
}

function EggShip({ w }: { w: Waypoint }) {
  return (
    <Rotated w={w}>
      <ShipHull ghost />
      <Label y={2.8} w={w} className="text-[11px] text-text-mute" />
    </Rotated>
  );
}

// ----------------------------------------------------------------- mega ----
const CONTAINERS: [number, string][] = [
  [-3, "#00FF88"],
  [-1, "#FFB020"],
  [1, "#FFFFFF"],
  [3, "#00FF88"],
  [5, "#FFB020"],
];

function MegaShip({ w }: { w: Waypoint }) {
  return (
    <Rotated w={w}>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[14, 2, 2.4]} />
        <meshStandardMaterial color="#1a7a40" emissive="#25DB79" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-5, 3, 0]} castShadow>
        <boxGeometry args={[3, 2, 2]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-5, 4.1, 0]}>
        <boxGeometry args={[3.2, 0.2, 2.2]} />
        <meshStandardMaterial color="#AA2222" />
      </mesh>
      {CONTAINERS.map(([x, color]) => (
        <mesh key={x} position={[x, 2.4, 0]} castShadow>
          <boxGeometry args={[1.6, 0.8, 1.8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[6.5, 4, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[6.5, 6.1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={1} />
      </mesh>
      {/* Green aura (no depth write so it never hides what's behind it) */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[12, 24, 24]} />
        <meshBasicMaterial color="#25DB79" opacity={0.08} transparent depthWrite={false} />
      </mesh>
      <Html position={[0, 8, 0]} distanceFactor={25} {...LABEL_PROPS}>
        <div className="font-mono text-xl font-extrabold whitespace-nowrap text-green [text-shadow:0_0_20px_var(--green)]">
          ◉ EVOLVERE
        </div>
      </Html>
    </Rotated>
  );
}

export default function Waypoints() {
  return (
    <>
      {WAYPOINTS.map((w) => {
        switch (w.kind) {
          case "landmark":
            return <Landmark key={w.id} w={w} />;
          case "buoy":
            return <Buoy key={w.id} w={w} />;
          case "ship":
            return <ClientShip key={w.id} w={w} />;
          case "mega":
            return <MegaShip key={w.id} w={w} />;
          case "egg":
            return <EggShip key={w.id} w={w} />;
        }
      })}
    </>
  );
}
