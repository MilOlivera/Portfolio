"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, DoubleSide } from "three";
import { RIVER_WIDTH, frameAtZ } from "./river-geometry";
import { ZONE_BANDS } from "./route-info";

// Translucent bands painted on the channel for regulated stretches:
// km 96–97.5 no-turning zone (red) and the GNL Escobar area (yellow).
// Ribbons follow the centerline, a hair above the wave crests (≈0.075).
const BAND_Y = 0.09;
const STEP = 2;

function buildBand(fromZ: number, toZ: number) {
  const rows = Math.max(2, Math.ceil((toZ - fromZ) / STEP) + 1);
  const half = RIVER_WIDTH / 2;
  const pos = new Float32Array(rows * 2 * 3);
  for (let r = 0; r < rows; r++) {
    const f = frameAtZ(fromZ + ((toZ - fromZ) * r) / (rows - 1));
    pos.set([f.x + f.wx * half, BAND_Y, f.z + f.wz * half, f.x - f.wx * half, BAND_Y, f.z - f.wz * half], r * 6);
  }
  const index: number[] = [];
  for (let r = 0; r < rows - 1; r++) {
    const a = r * 2;
    index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setIndex(index);
  return geo;
}

export default function ZoneBands() {
  const bands = useMemo(
    () => ZONE_BANDS.map((b) => ({ ...b, geo: buildBand(b.fromZ, b.toZ), mid: frameAtZ((b.fromZ + b.toZ) / 2) })),
    [],
  );

  return (
    <>
      {bands.map((b) => (
        <group key={b.id}>
          <mesh geometry={b.geo} renderOrder={1}>
            <meshBasicMaterial color={b.color} transparent opacity={0.22} depthWrite={false} side={DoubleSide} />
          </mesh>
          <Html
            position={[b.mid.x, 1.2, b.mid.z]}
            center
            distanceFactor={14}
            pointerEvents="none"
            zIndexRange={[5, 0]}
          >
            <div
              className="rounded border bg-black/55 px-2 py-0.5 font-mono text-[11px] font-bold whitespace-nowrap"
              style={{ color: b.color, borderColor: b.color }}
            >
              {b.text}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}
