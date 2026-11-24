"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Object3D, Quaternion, Shape, Vector3, type InstancedMesh, type MeshStandardMaterial } from "three";
import { BANK_Y } from "./environment";

// GNL Escobar regasification terminal (mega landmark), on the west bank beside
// the circular turning basin centered (66, 0, 1100), r=34 (west edge x≈32).
// Pieces: a pile-supported platform at the water's edge with 3 articulated
// loading arms, 3 giant white spherical shore tanks inland, and an LNG
// carrier (metanero, Moss type) moored alongside with navigation lights.
// Buoys are handled elsewhere. Three.js materials can't read the site's CSS
// theme tokens, so the hex colors below are intentional.
const WHITE = "#f1f1ee";
const RED = "#c0281f";
const HULL_RED = "#7a1c18";
const HULL_TOP = "#1d1d1f";
const CONCRETE = "#9a978f";
const STEEL_DARK = "#555c60";

// Platform on piles (x ∈ [29, 33], z ∈ [1088, 1112], deck top y≈0.6)
const PLAT = { x0: 29, x1: 33, z0: 1088, z1: 1112, top: 0.6, thick: 0.4 };
const PILE_BOTTOM = -0.5;
const PILES: [number, number][] = [];
for (const x of [29.5, 31, 32.5]) for (let z = 1089; z <= 1111; z += 3.6) PILES.push([x, z]);

// Shore tanks (diameter 18), centers fixed by the brief
const TANK_R = 9;
const TANK_Z = [1080, 1102, 1124];
const TANK_X = 12;

// LNG carrier: hull center (37, 0, 1100), 20 long on Z (bow north), beam 3
const SHIP = { x: 37, z: 1100, len: 20, beam: 3, keel: -0.6, band: 0.4, deck: 0.8 };
const MOSS_Z = [1093.6, 1097.1, 1100.6, 1104.1];
const MOSS_R = 1.35;

// Loading arms: riser on the platform, inner boom up/out, outer boom down to
// the carrier's manifold (west side of the deck)
const ARM_Z = [1094, 1100, 1106];
const ARM_BASE_X = 31.6;
const RISER_TOP = 3.2;
const ELBOW = { dx: 33.6, y: 5.2 };
const MANIFOLD = { x: 35.9, y: 1.3 };

// Hull outline in the XZ plane (shape y = -world z, so +y is north/bow)
function hullShape() {
  const hb = SHIP.beam / 2;
  const half = SHIP.len / 2;
  const s = new Shape();
  s.moveTo(-hb, -half);
  s.lineTo(hb, -half);
  s.lineTo(hb, half - 3);
  s.quadraticCurveTo(hb, half - 0.6, 0, half);
  s.quadraticCurveTo(-hb, half - 0.6, -hb, half - 3);
  s.closePath();
  return s;
}

// Cylinder spanning two points (thin structural member)
function Beam({ a, b, r, color }: { a: [number, number, number]; b: [number, number, number]; r: number; color: string }) {
  const { pos, quat, len } = useMemo(() => {
    const va = new Vector3(...a);
    const vb = new Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = dir.length();
    const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
    return { pos: va.add(vb).multiplyScalar(0.5), quat, len };
  }, [a, b]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
    </mesh>
  );
}

function LoadingArm({ z }: { z: number }) {
  const base: [number, number, number] = [ARM_BASE_X, PLAT.top, z];
  const top: [number, number, number] = [ARM_BASE_X, RISER_TOP, z];
  const elbow: [number, number, number] = [ELBOW.dx, ELBOW.y, z];
  const end: [number, number, number] = [MANIFOLD.x, MANIFOLD.y, z];
  return (
    <group>
      <Beam a={base} b={top} r={0.22} color={WHITE} />
      <Beam a={top} b={elbow} r={0.13} color={WHITE} />
      <Beam a={elbow} b={end} r={0.11} color={WHITE} />
      {[top, elbow].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.26, 8, 6]} />
          <meshStandardMaterial color={RED} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function Carrier() {
  const shape = useMemo(hullShape, []);
  const masthead = useRef<MeshStandardMaterial>(null);

  // White masthead light: short blink every 2 s (material mutation, no state)
  useFrame(({ clock }) => {
    if (masthead.current) masthead.current.emissiveIntensity = clock.elapsedTime % 2 < 0.25 ? 4 : 0.4;
  });

  const aftZ = 1108;
  const bandH = SHIP.deck - SHIP.band;
  return (
    <group position={[SHIP.x, 0, SHIP.z]}>
      {/* Extruded hull: rotate so shape +y → world -z and extrusion depth → up */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SHIP.keel, 0]} castShadow>
        <extrudeGeometry args={[shape, { depth: SHIP.band - SHIP.keel, bevelEnabled: false }]} />
        <meshStandardMaterial color={HULL_RED} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SHIP.band, 0]} castShadow>
        <extrudeGeometry args={[shape, { depth: bandH, bevelEnabled: false }]} />
        <meshStandardMaterial color={HULL_TOP} roughness={0.6} />
      </mesh>

      {/* Moss spherical cargo tanks, half sunk into the hull */}
      {MOSS_Z.map((z) => (
        <mesh key={z} position={[0, SHIP.deck + 0.45, z - SHIP.z]} castShadow>
          <sphereGeometry args={[MOSS_R, 14, 10]} />
          <meshStandardMaterial color={WHITE} roughness={0.45} />
        </mesh>
      ))}

      {/* Accommodation block aft + bridge deck + red funnel */}
      <mesh position={[0, SHIP.deck + 0.9, aftZ - SHIP.z]} castShadow>
        <boxGeometry args={[2.6, 1.8, 2]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, SHIP.deck + 1.95, aftZ - SHIP.z - 0.3]}>
        <boxGeometry args={[3, 0.3, 1.1]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, SHIP.deck + 2.4, aftZ - SHIP.z + 0.7]}>
        <cylinderGeometry args={[0.32, 0.38, 1.3, 8]} />
        <meshStandardMaterial color={RED} roughness={0.6} />
      </mesh>

      {/* Foremast carrying the white masthead light */}
      <mesh position={[0, SHIP.deck + 1.2, -7.6]}>
        <cylinderGeometry args={[0.05, 0.07, 2.4, 5]} />
        <meshStandardMaterial color={WHITE} roughness={0.6} />
      </mesh>
      <mesh position={[0, SHIP.deck + 2.5, -7.6]}>
        <sphereGeometry args={[0.12, 8, 6]} />
        <meshStandardMaterial ref={masthead} color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>

      {/* Sidelights on the bridge wings: green starboard (east, +x), red port */}
      <mesh position={[1.5, SHIP.deck + 2.15, aftZ - SHIP.z - 0.3]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#29d45a" emissive="#29d45a" emissiveIntensity={3} />
      </mesh>
      <mesh position={[-1.5, SHIP.deck + 2.15, aftZ - SHIP.z - 0.3]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#ff2a2a" emissive="#ff2a2a" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

export default function GNLEscobar() {
  const piles = useRef<InstancedMesh>(null);
  const pileLen = PLAT.top - PLAT.thick - PILE_BOTTOM;

  useLayoutEffect(() => {
    const mesh = piles.current;
    if (!mesh) return;
    const o = new Object3D();
    PILES.forEach(([x, z], i) => {
      o.position.set(x, PILE_BOTTOM + pileLen / 2, z);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [pileLen]);

  return (
    <group>
      {/* Platform deck + instanced piles */}
      <mesh
        position={[(PLAT.x0 + PLAT.x1) / 2, PLAT.top - PLAT.thick / 2, (PLAT.z0 + PLAT.z1) / 2]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[PLAT.x1 - PLAT.x0, PLAT.thick, PLAT.z1 - PLAT.z0]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.9} />
      </mesh>
      <instancedMesh ref={piles} args={[undefined, undefined, PILES.length]}>
        <cylinderGeometry args={[0.18, 0.18, pileLen, 6]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.95} />
      </instancedMesh>

      {ARM_Z.map((z) => (
        <LoadingArm key={z} z={z} />
      ))}

      {/* Shore tanks: white sphere on a short concrete skirt */}
      {TANK_Z.map((z) => (
        <group key={z} position={[TANK_X, BANK_Y, z]}>
          <mesh position={[0, TANK_R, 0]} castShadow receiveShadow>
            <sphereGeometry args={[TANK_R, 24, 16]} />
            <meshStandardMaterial color={WHITE} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[6.2, 6.6, 2, 20]} />
            <meshStandardMaterial color={CONCRETE} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Gas send-out line: tanks → platform, on low sleepers */}
      <mesh position={[(TANK_X + TANK_R + PLAT.x0) / 2 + 0.5, BANK_Y + 0.5, 1102]}>
        <boxGeometry args={[PLAT.x0 - TANK_X - TANK_R + 1, 0.35, 0.6]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[TANK_X + TANK_R + 1.5, BANK_Y + 0.5, 1102]}>
        <boxGeometry args={[0.6, 0.35, TANK_Z[2] - TANK_Z[0]]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.7} metalness={0.3} />
      </mesh>

      <Carrier />
    </group>
  );
}
