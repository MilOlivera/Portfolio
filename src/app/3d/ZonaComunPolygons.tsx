"use client";

import { Html, Line } from "@react-three/drei";
import { ZONA_POLYGONS } from "./waypoints-data";

// Zona Común as on the SHN chart: four anchoring areas outlined on the water.
// The ships anchored in them are waypoints (Waypoints.tsx). Hex colors:
// Three.js can't read the CSS theme tokens.
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

export default function ZonaComunPolygons() {
  return (
    <>
      {ZONA_POLYGONS.map((p) => (
        <Area key={p.id} p={p} />
      ))}
    </>
  );
}
