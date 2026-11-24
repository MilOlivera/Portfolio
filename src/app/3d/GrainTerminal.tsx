"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Object3D, Quaternion, Vector3, type InstancedMesh } from "three";
import { BANK_Y } from "./environment";

// "Transferencia de Granos" grain terminal on the west bank: a row of silos,
// a tall elevator tower, an inclined conveyor gallery down to a small pier at
// the water's edge and a ship-loader spout at the pier head.
// Built in a local frame aligned with the river: local +X = downstream
// tangent, local +Z = inland, local -Z = toward the water
// (rotation.y = atan2(-tz, tx) maps local +X → (tx, tz), local +Z → (-tz, tx)).
// The water edge sits ~5.5 units riverward of the anchor (local z ≈ -5.5).
// Three.js materials can't read the site's CSS theme tokens, so the hex
// colors below are intentional.
const ANCHOR: [number, number] = [115.4, 1501.6];
const TANGENT: [number, number] = [0.164, 0.986];
const ROT_Y = Math.atan2(-TANGENT[1], TANGENT[0]);
const EDGE_Z = -5.5;

const SILO = "#d9d2c0";
const SILO_CAP = "#b9b2a2";
const STEEL = "#8d959a";
const STEEL_DARK = "#545b60";
const CONCRETE = "#9a968d";
const CLADDING = "#c9c4b6";

const SILO_R = 0.7;
const SILO_H = 7;
const SILO_Z = 5;
const SILO_X = Array.from({ length: 8 }, (_, i) => -5.25 + i * 1.5);

const TOWER = { x: 6.8, z: 5, w: 1.6, h: 12 };
const PIER = { top: 0.6, thick: 0.3, headZ: -8.8, headLen: 7.6, headD: 1.6 };
const LOADER_TOP = 4.6;
const CONV_TOP: [number, number, number] = [TOWER.x, BANK_Y + 10, TOWER.z - TOWER.w / 2];
const CONV_END: [number, number, number] = [TOWER.x, LOADER_TOP + 0.3, PIER.headZ + 0.3];

// Pier piles: under the trestle and the pier head
const PILES: [number, number][] = [
  [TOWER.x - 0.4, -6],
  [TOWER.x + 0.4, -6],
  [TOWER.x - 0.4, -7.4],
  [TOWER.x + 0.4, -7.4],
  ...[-3.4, -1.7, 0, 1.7, 3.4].flatMap((dx) => [
    [TOWER.x + dx, PIER.headZ - 0.6] as [number, number],
    [TOWER.x + dx, PIER.headZ + 0.6] as [number, number],
  ]),
];
const PILE_BOTTOM = -0.5;
const PILE_LEN = PIER.top - PIER.thick - PILE_BOTTOM;

// Box spanning two points (local +Z of the box along the segment)
function Span({
  a,
  b,
  w,
  h,
  color,
}: {
  a: [number, number, number];
  b: [number, number, number];
  w: number;
  h: number;
  color: string;
}) {
  const { pos, quat, len } = useMemo(() => {
    const va = new Vector3(...a);
    const vb = new Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), dir.normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat, len };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <boxGeometry args={[w, h, len]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

// Point on the conveyor at a given local z (for support legs)
function convY(z: number) {
  const t = (z - CONV_TOP[2]) / (CONV_END[2] - CONV_TOP[2]);
  return CONV_TOP[1] + (CONV_END[1] - CONV_TOP[1]) * t;
}

function usePlaced(ref: RefObject<InstancedMesh | null>, place: (o: Object3D, i: number) => void, n: number) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(0, 0, 0);
      place(o, i);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [ref, place, n]);
}

const placeSilo = (o: Object3D, i: number) => o.position.set(SILO_X[i], BANK_Y + SILO_H / 2, SILO_Z);
const placeCap = (o: Object3D, i: number) => o.position.set(SILO_X[i], BANK_Y + SILO_H + 0.3, SILO_Z);
const placePile = (o: Object3D, i: number) =>
  o.position.set(PILES[i][0], PILE_BOTTOM + PILE_LEN / 2, PILES[i][1]);

export default function GrainTerminal() {
  const silos = useRef<InstancedMesh>(null);
  const caps = useRef<InstancedMesh>(null);
  const piles = useRef<InstancedMesh>(null);
  usePlaced(silos, placeSilo, SILO_X.length);
  usePlaced(caps, placeCap, SILO_X.length);
  usePlaced(piles, placePile, PILES.length);

  const galleryY = BANK_Y + SILO_H + 0.9;
  const legZ = [0.5, -4];
  const trestleLen = PIER.headZ + PIER.headD / 2 - EDGE_Z;
  const spoutTip: [number, number, number] = [TOWER.x, 1.4, PIER.headZ - 3];

  return (
    <group position={[ANCHOR[0], 0, ANCHOR[1]]} rotation={[0, ROT_Y, 0]}>
      {/* Concrete yard */}
      <mesh position={[0.5, BANK_Y + 0.03, 3.2]} receiveShadow>
        <boxGeometry args={[18, 0.06, 7]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </mesh>

      {/* Silo row (instanced bodies + conical caps) */}
      <instancedMesh ref={silos} args={[undefined, undefined, SILO_X.length]} castShadow receiveShadow>
        <cylinderGeometry args={[SILO_R, SILO_R, SILO_H, 12]} />
        <meshStandardMaterial color={SILO} roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, undefined, SILO_X.length]}>
        <coneGeometry args={[SILO_R, 0.6, 12]} />
        <meshStandardMaterial color={SILO_CAP} roughness={0.7} />
      </instancedMesh>

      {/* Top gallery over the silos, feeding from the elevator tower */}
      <mesh position={[(SILO_X[0] + TOWER.x) / 2, galleryY, SILO_Z]}>
        <boxGeometry args={[TOWER.x - SILO_X[0], 0.5, 0.5]} />
        <meshStandardMaterial color={CLADDING} roughness={0.7} />
      </mesh>

      {/* Elevator tower + headhouse */}
      <mesh position={[TOWER.x, BANK_Y + TOWER.h / 2, TOWER.z]} castShadow>
        <boxGeometry args={[TOWER.w, TOWER.h, TOWER.w]} />
        <meshStandardMaterial color={CLADDING} roughness={0.75} />
      </mesh>
      <mesh position={[TOWER.x, BANK_Y + TOWER.h + 0.6, TOWER.z]} castShadow>
        <boxGeometry args={[TOWER.w + 0.5, 1.2, TOWER.w + 0.5]} />
        <meshStandardMaterial color={STEEL} roughness={0.7} />
      </mesh>

      {/* Inclined conveyor gallery: tower → ship loader, with support legs */}
      <Span a={CONV_TOP} b={CONV_END} w={0.6} h={0.55} color={CLADDING} />
      {legZ.map((z) => {
        const top = convY(z) - 0.3;
        const base = z > EDGE_Z ? BANK_Y : PIER.top;
        return (
          <mesh key={z} position={[TOWER.x, (top + base) / 2, z]}>
            <boxGeometry args={[0.25, top - base, 0.25]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.8} />
          </mesh>
        );
      })}

      {/* Pier: trestle from the bank edge + pier head along the river */}
      <mesh position={[TOWER.x, PIER.top - PIER.thick / 2, EDGE_Z + trestleLen / 2]} receiveShadow>
        <boxGeometry args={[1.2, PIER.thick, Math.abs(trestleLen) + 0.5]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <mesh position={[TOWER.x, PIER.top - PIER.thick / 2, PIER.headZ]} castShadow receiveShadow>
        <boxGeometry args={[PIER.headLen, PIER.thick, PIER.headD]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <instancedMesh ref={piles} args={[undefined, undefined, PILES.length]}>
        <cylinderGeometry args={[0.14, 0.14, PILE_LEN, 6]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </instancedMesh>

      {/* Ship loader: tower on the pier head, boom out over the water, spout */}
      <mesh position={[TOWER.x, (PIER.top + LOADER_TOP) / 2, PIER.headZ]} castShadow>
        <boxGeometry args={[0.8, LOADER_TOP - PIER.top, 0.8]} />
        <meshStandardMaterial color={STEEL} roughness={0.6} metalness={0.3} />
      </mesh>
      <Span
        a={[TOWER.x, LOADER_TOP, PIER.headZ]}
        b={[TOWER.x, LOADER_TOP - 0.4, spoutTip[2]]}
        w={0.45}
        h={0.4}
        color={STEEL}
      />
      <Span
        a={[TOWER.x, LOADER_TOP - 0.5, spoutTip[2]]}
        b={spoutTip}
        w={0.2}
        h={0.2}
        color={STEEL_DARK}
      />

      {/* Truck intake shed at the inland end of the silo row */}
      <mesh position={[SILO_X[0] - 2, BANK_Y + 0.9, 3.4]} castShadow>
        <boxGeometry args={[2.4, 1.8, 2.6]} />
        <meshStandardMaterial color={CLADDING} roughness={0.8} />
      </mesh>
    </group>
  );
}
