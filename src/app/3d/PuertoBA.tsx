"use client";

import { Html } from "@react-three/drei";
import { useMemo, type ReactNode } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute } from "three";
import { BANK_Y } from "./environment";
import { BA_CHANNELS } from "./river-geometry";

// Puerto Buenos Aires, west of the km 12 fork (to starboard sailing down):
// the Norte and Sur access channels and, on the coast, silhouettes of the
// Buquebus tower (north), the ENEL power station, the EXOLGAN container
// terminal and a low city skyline behind. Scenery only — none of it is
// navigable. Three.js can't read the CSS theme tokens → hex colors.
const CHANNEL_COLOR = "#0f2422";
const CHANNEL_Y = 0.088;
const CHANNEL_W = 3;
const CONCRETE = "#9a968d";
const WHITE = "#ecebe6";
const GLASS = "#33546b";
const ORANGE = "#e8742c";
const STEEL = "#7d858a";
const RED = "#b3261e";
const BRICK = "#8a5a44";
const CONTAINER_COLORS = ["#b3261e", "#1f5a8a", "#2f7a46", "#d49a1f", "#8c8f93"];
const SKY_COLORS = ["#8a929c", "#6f7a86", "#9aa6b2", "#a9b1b8"];

/** Flat ribbon along a polyline. */
function ribbon(path: [number, number][]) {
  const pts: number[] = [];
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1];
    const [bx, bz] = path[i];
    const len = Math.hypot(bx - ax, bz - az);
    const nx = (-(bz - az) / len) * (CHANNEL_W / 2);
    const nz = ((bx - ax) / len) * (CHANNEL_W / 2);
    const quad = [
      [ax + nx, az + nz],
      [ax - nx, az - nz],
      [bx + nx, bz + nz],
      [bx - nx, bz - nz],
    ];
    for (const k of [0, 1, 2, 1, 3, 2]) pts.push(quad[k][0], CHANNEL_Y, quad[k][1]);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return geo;
}

function Box({ p, s, c }: { p: [number, number, number]; s: [number, number, number]; c: string }) {
  return (
    <mesh position={p} castShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.8} />
    </mesh>
  );
}

function Sign({ y, children }: { y: number; children: ReactNode }) {
  return (
    <Html position={[0, y, 0]} center distanceFactor={28} pointerEvents="none" zIndexRange={[5, 0]}>
      <div className="rounded bg-black/60 px-2 py-0.5 font-mono text-sm font-bold tracking-[0.2em] whitespace-nowrap text-text">
        {children}
      </div>
    </Html>
  );
}

/** Ferry terminal: tall glass tower with an orange crown over a low hall. */
function Buquebus() {
  return (
    <group position={[58, BANK_Y, 443]}>
      <Box p={[0, 8, 0]} s={[3.5, 16, 3.5]} c={GLASS} />
      <Box p={[0, 16.6, 0]} s={[3.8, 1.2, 3.8]} c={ORANGE} />
      {[3, 6, 9, 12].map((y) => (
        <Box key={y} p={[0, y, 0]} s={[3.6, 0.15, 3.6]} c={WHITE} />
      ))}
      <Box p={[0.5, 1, 3.5]} s={[5, 2, 3]} c={WHITE} />
      <Sign y={19}>BUQUEBUS</Sign>
    </group>
  );
}

/** Power station: turbine hall, two banded chimneys, fuel tanks. */
function Enel() {
  return (
    <group position={[58, BANK_Y, 470]}>
      <Box p={[0, 2, 0]} s={[6, 4, 8]} c={BRICK} />
      <Box p={[0, 4.4, 0]} s={[6.2, 0.8, 8.2]} c={STEEL} />
      {[-2.5, 1.5].map((z) => (
        <group key={z} position={[-5, 0, z]}>
          <mesh position={[0, 6.5, 0]} castShadow>
            <cylinderGeometry args={[0.5, 0.8, 13, 10]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[0, 12, 0]}>
            <cylinderGeometry args={[0.56, 0.6, 1.2, 10]} />
            <meshStandardMaterial color={RED} />
          </mesh>
        </group>
      ))}
      {[-6.5, 6.5].map((z) => (
        <mesh key={z} position={[0.5, 1.2, z]} castShadow>
          <cylinderGeometry args={[1.8, 1.8, 2.4, 14]} />
          <meshStandardMaterial color={WHITE} roughness={0.5} />
        </mesh>
      ))}
      <Sign y={15}>ENEL</Sign>
    </group>
  );
}

/** Container terminal: quay, colored stacks and two ship-to-shore cranes. */
function Exolgan() {
  return (
    <group position={[63, BANK_Y, 490]}>
      <Box p={[0, 0.1, 0]} s={[9, 0.2, 16]} c={CONCRETE} />
      {Array.from({ length: 18 }, (_, i) => {
        const h = 0.9 * (1 + ((i * 7) % 3));
        return (
          <Box
            key={i}
            p={[-3 + (i % 3) * 2, h / 2 + 0.2, -6 + Math.floor(i / 3) * 2.4]}
            s={[1.5, h, 2]}
            c={CONTAINER_COLORS[i % CONTAINER_COLORS.length]}
          />
        );
      })}
      {/* Cranes: portal on the quay edge, boom reaching out over the water (+X) */}
      {[-4, 4].map((z) => (
        <group key={z} position={[3.5, 0, z]}>
          {[-1.2, 1.2].map((dz) => (
            <Box key={dz} p={[0, 3.5, dz]} s={[0.35, 7, 0.35]} c={RED} />
          ))}
          <Box p={[0, 7, 0]} s={[0.5, 0.4, 2.8]} c={RED} />
          <Box p={[1.8, 7.5, 0]} s={[8, 0.4, 0.5]} c={WHITE} />
          <Box p={[-0.2, 9, 0]} s={[0.3, 3, 0.3]} c={RED} />
        </group>
      ))}
      <Sign y={12}>EXOLGAN</Sign>
    </group>
  );
}

// Low, wide blocks far behind the port (Aeroparque.tsx adds the towers)
const SKYLINE = Array.from({ length: 22 }, (_, i) => ({
  x: 22 + ((i * 13) % 26),
  z: 448 + i * 3.4,
  w: 4 + ((i * 5) % 4),
  h: 2 + ((i * 7) % 5),
  c: SKY_COLORS[i % SKY_COLORS.length],
}));

export default function PuertoBA() {
  const channels = useMemo(() => BA_CHANNELS.map((c) => ({ ...c, geo: ribbon(c.path) })), []);

  return (
    <group>
      {channels.map((c) => {
        const [x, z] = c.path[1];
        return (
          <group key={c.name}>
            <mesh geometry={c.geo}>
              <meshBasicMaterial color={CHANNEL_COLOR} transparent opacity={0.3} depthWrite={false} side={DoubleSide} />
            </mesh>
            <Html position={[x, 1.2, z]} center distanceFactor={16} pointerEvents="none" zIndexRange={[5, 0]}>
              <div className="rounded border border-text-mute/60 bg-black/55 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap text-text-mid">
                {c.name} · ACCESO BA
              </div>
            </Html>
          </group>
        );
      })}
      <Buquebus />
      <Enel />
      <Exolgan />
      {SKYLINE.map((b) => (
        <Box key={b.z} p={[b.x, BANK_Y + b.h / 2, b.z]} s={[b.w, b.h, 4]} c={b.c} />
      ))}
    </group>
  );
}
