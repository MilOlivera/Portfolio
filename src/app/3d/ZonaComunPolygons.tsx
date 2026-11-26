"use client";

import { Html, Line } from "@react-three/drei";
import { ANCHORED_SHIPS, ZONA_POLYGONS, type AnchoredShip } from "./waypoints-data";

// Zona Común as on the SHN chart: four anchoring areas outlined on the water,
// plus the ships waiting in them. The client ships are waypoints
// (Waypoints.tsx); these are decoration. Hex colors: Three.js can't read the
// CSS theme tokens.
const BORDER = "#c82828";
const OUTLINE_Y = 1;
const FILL_Y = 0.15; // just above the wave crests

function Area({ p }: { p: (typeof ZONA_POLYGONS)[number] }) {
  const w = p.maxX - p.minX;
  const l = p.maxZ - p.minZ;
  const cx = (p.minX + p.maxX) / 2;
  const cz = (p.minZ + p.maxZ) / 2;
  return (
    <group>
      <Line
        points={[
          [p.minX, OUTLINE_Y, p.minZ],
          [p.maxX, OUTLINE_Y, p.minZ],
          [p.maxX, OUTLINE_Y, p.maxZ],
          [p.minX, OUTLINE_Y, p.maxZ],
          [p.minX, OUTLINE_Y, p.minZ],
        ]}
        color={BORDER}
        lineWidth={2}
        transparent
        opacity={0.7}
        fog
      />
      <mesh position={[cx, FILL_Y, cz]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, l]} />
        <meshBasicMaterial color={BORDER} transparent opacity={0.05} depthWrite={false} />
      </mesh>
      <Html position={[cx, 5, cz]} center distanceFactor={30} pointerEvents="none" zIndexRange={[5, 0]}>
        <div className="rounded border border-green/60 bg-black/60 px-2 py-0.5 font-mono text-base font-bold tracking-[0.2em] whitespace-nowrap text-green">
          {p.id}
        </div>
      </Html>
    </group>
  );
}

/** Large: tanker / bulk carrier with aft bridge and hatches. Small: coaster / sand dredger. */
function Anchored({ s }: { s: AnchoredShip }) {
  const large = s.length > 8;
  const beam = large ? 2.2 : 1.2;
  const depth = large ? 1.2 : 0.6;
  const bridge = large ? 2 : 1.2;
  return (
    <group position={[s.x, 0, s.z]} rotation={[0, s.yaw, 0]}>
      <mesh position={[0, depth / 2, 0]} castShadow>
        <boxGeometry args={[s.length, depth, beam]} />
        <meshStandardMaterial color={s.hull} />
      </mesh>
      {/* Boot-topping at the waterline */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[s.length + 0.04, 0.2, beam + 0.04]} />
        <meshStandardMaterial color="#6a1f1a" />
      </mesh>
      <mesh position={[-s.length / 2 + bridge * 0.8, depth + bridge * 0.4, 0]} castShadow>
        <boxGeometry args={[bridge * 0.8, bridge * 0.8, beam * 0.8]} />
        <meshStandardMaterial color="#f2f2ee" />
      </mesh>
      {large ? (
        [-0.12, 0.1, 0.32].map((f) => (
          <mesh key={f} position={[s.length * f, depth + 0.12, 0]}>
            <boxGeometry args={[s.length * 0.16, 0.24, beam * 0.65]} />
            <meshStandardMaterial color="#8a5a44" />
          </mesh>
        ))
      ) : (
        <mesh position={[s.length * 0.15, depth + 0.15, 0]}>
          <boxGeometry args={[s.length * 0.4, 0.3, beam * 0.7]} />
          <meshStandardMaterial color="#b59a62" />
        </mesh>
      )}
      {/* Anchor light on the foremast */}
      <mesh position={[s.length / 2 - 0.4, depth + 0.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
      <mesh position={[s.length / 2 - 0.4, depth + 1.25, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

export default function ZonaComunPolygons() {
  return (
    <>
      {ZONA_POLYGONS.map((p) => (
        <Area key={p.id} p={p} />
      ))}
      {ANCHORED_SHIPS.map((s) => (
        <Anchored key={`${s.x},${s.z}`} s={s} />
      ))}
    </>
  );
}
