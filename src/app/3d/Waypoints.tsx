"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { MeshStandardMaterial } from "three";
import { BANK_Y } from "./environment";
import { VISUAL_HALF, bankPoint } from "./river-geometry";
import { MOORED_LENGTH, OPEN_WAYPOINT_EVENT, WAYPOINTS, type Waypoint } from "./waypoints-data";

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
// Low block inside its collision circle (side = r, so neighbours don't merge).
// Landmarks are labels only: their structures are dedicated components
// (RefineryPAE, GNLEscobar, PNALima, GrainTerminal, Aeroparque, ZarateBridge…).
function Landmark({ w }: { w: Waypoint }) {
  return (
    <group position={w.site ?? w.pos}>
      <Label
        y={w.labelY ?? 3}
        w={w}
        className={`bg-black/60 px-2 py-1 text-xs font-bold ${w.struck ? "text-warn" : "text-text"}`}
      />
    </group>
  );
}

// --------------------------------------------------------------- vuelta ----
// Nautical warning sign on the bank beside the bend (pos is on the centerline).
function VueltaSign({ w }: { w: Waypoint }) {
  const [x, z] = bankPoint(w.pos[0], w.pos[2], VISUAL_HALF + 1.5);
  return (
    <group position={[x, BANK_Y, z]}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      <mesh position={[0, 1.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.04]} />
        <meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={0.25} />
      </mesh>
      <Html position={[0, 2, 0]} distanceFactor={14} {...LABEL_PROPS}>
        <div className="rounded border border-warn/80 bg-bg/80 px-2 py-1 text-center font-mono whitespace-nowrap text-warn">
          <div className="text-xs font-bold">⚠ {w.title}</div>
          {w.subtitle && <div className="text-[10px] opacity-80">{w.subtitle}</div>}
        </div>
      </Html>
    </group>
  );
}

// ----------------------------------------------------------------- buoy ----
// IALA buoyage. Light characters, simulated on emissive intensity (0..1):
//  special      — slow yellow pulse
//  cardinal-E   — Q(3): three quick white flashes, then dark
const IALA_YELLOW = "#F7D417";
const BLACK = "#111111";

function lightLevel(type: Waypoint["buoyType"], t: number) {
  if (type === "cardinal-east") {
    const c = t % 4; // 4 s cycle
    return c < 1.5 && c % 0.5 < 0.22 ? 1 : 0.05;
  }
  return (Math.sin(t * 2.5) + 1) / 2;
}

const PROJECT_BUOY_SCALE = 0.6; // modelled ~2.5 u tall; 1 u = 20 m

function Buoy({ w }: { w: Waypoint }) {
  const light = useRef<MeshStandardMaterial>(null);
  const cardinal = w.buoyType === "cardinal-east";
  const lightColor = cardinal ? "#FFFFFF" : IALA_YELLOW;
  const peak = w.dim ? 1.2 : 2.5;

  useFrame(({ clock }) => {
    if (!w.pulse || !light.current) return;
    light.current.emissiveIntensity = peak * lightLevel(w.buoyType, clock.elapsedTime + w.pos[0]);
  });

  return (
    <group position={w.pos} scale={PROJECT_BUOY_SCALE}>
      {cardinal ? (
        // East cardinal body: black–yellow–black bands, bottom to top
        <>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.73, 0.8, 0.5, 12]} />
            <meshStandardMaterial color={BLACK} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.67, 0.73, 0.5, 12]} />
            <meshStandardMaterial color={IALA_YELLOW} />
          </mesh>
          <mesh position={[0, 1, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.67, 0.5, 12]} />
            <meshStandardMaterial color={BLACK} />
          </mesh>
        </>
      ) : (
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.8, 1.5, 12]} />
          <meshStandardMaterial color={IALA_YELLOW} />
        </mesh>
      )}

      {/* Topmark mast */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>

      {cardinal ? (
        // East topmark: two black cones BASE TO BASE (◆). (Points together ⧗ would be West.)
        <>
          <mesh position={[0, 1.8, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.15, 0.3, 8]} />
            <meshStandardMaterial color={BLACK} />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <coneGeometry args={[0.15, 0.3, 8]} />
            <meshStandardMaterial color={BLACK} />
          </mesh>
        </>
      ) : (
        // Special mark topmark: yellow X
        <>
          <mesh position={[0, 1.8, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.6, 0.08, 0.08]} />
            <meshStandardMaterial color={IALA_YELLOW} />
          </mesh>
          <mesh position={[0, 1.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.6, 0.08, 0.08]} />
            <meshStandardMaterial color={IALA_YELLOW} />
          </mesh>
        </>
      )}

      {/* Light */}
      <mesh position={[0, cardinal ? 2.45 : 2.25, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial ref={light} color={lightColor} emissive={lightColor} emissiveIntensity={peak} />
      </mesh>

      <Label y={3.4} w={w} className={`text-xs text-warn ${w.dim ? "opacity-60" : ""}`} />
    </group>
  );
}

// ----------------------------------------------------------------- ship ----
function ShipHull({ ghost = false, hull = "#1a4a30" }: { ghost?: boolean; hull?: string }) {
  const mat = ghost ? { transparent: true, opacity: 0.45 } : {};
  return (
    <>
      <mesh position={[0, 0.5, 0]} castShadow={!ghost}>
        <boxGeometry args={[6, 1, 1.2]} />
        <meshStandardMaterial color={ghost ? "#555555" : hull} {...mat} />
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
  const [hover, setHover] = useState(false);
  const clickable = Boolean(w.clickable && w.media);

  useEffect(() => {
    if (!clickable) return;
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover, clickable]);

  return (
    <group
      position={w.pos}
      rotation={[0, w.rotation ?? 0, 0]}
      // Zona Común ships: click opens the project carousel (AlTravesDetector)
      onClick={
        clickable
          ? (e) => {
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent(OPEN_WAYPOINT_EVENT, { detail: w.id }));
            }
          : undefined
      }
      onPointerOver={clickable ? () => setHover(true) : undefined}
      onPointerOut={clickable ? () => setHover(false) : undefined}
    >
      {children}
    </group>
  );
}

function ClientShip({ w }: { w: Waypoint }) {
  return (
    <Rotated w={w}>
      <ShipHull hull={w.color} />
      <Label
        y={3}
        w={w}
        className="border border-phosphor bg-black/70 px-2 py-1 text-sm font-bold text-phosphor"
      />
    </Rotated>
  );
}

// Ship moored at Campana: plain tanker, bow north, discreet label. Low
// freeboard (loading) so the refinery shows over the line.
const MOORED_BEAM = { medium: 0.85, large: 1.15 } as const;

function MooredShip({ w }: { w: Waypoint }) {
  const size = w.size ?? "medium";
  return (
    <Rotated w={w}>
      {/* modelled 6 × 1 × 1.2 u */}
      <group scale={[MOORED_LENGTH[size] / 6, 0.6, MOORED_BEAM[size]]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[6, 1, 1.2]} />
          <meshStandardMaterial color={size === "large" ? "#6a2a2a" : "#2f3f4c"} />
        </mesh>
        <mesh position={[-2.2, 1.5, 0]} castShadow>
          <boxGeometry args={[1.3, 1, 1]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh position={[-2.2, 2.05, 0]}>
          <boxGeometry args={[1.4, 0.1, 1.1]} />
          <meshStandardMaterial color="#AA2222" />
        </mesh>
      </group>
      <Label y={2.2} w={w} className="bg-black/50 px-1.5 py-0.5 text-[11px] text-text-mid" />
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
          case "fsru": // the FSRU model is FSRUExpedient.tsx; here only its label
            return <Landmark key={w.id} w={w} />;
          case "buoy":
            return <Buoy key={w.id} w={w} />;
          case "ship":
            return <ClientShip key={w.id} w={w} />;
          case "mega":
            return <MegaShip key={w.id} w={w} />;
          case "egg":
            return <EggShip key={w.id} w={w} />;
          case "vuelta":
            return <VueltaSign key={w.id} w={w} />;
          case "moored-ship":
            return <MooredShip key={w.id} w={w} />;
        }
      })}
    </>
  );
}
