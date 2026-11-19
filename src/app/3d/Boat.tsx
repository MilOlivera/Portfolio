"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type Ref } from "react";
import { Shape, type Group, type MeshStandardMaterial } from "three";

// B/T NANY low-poly river tanker (83 × 13.8 m, ~6:1). Bow points to +X,
// stern (bridge) to -X. Three.js materials can't read CSS tokens → hex.
const HULL = "#1a7a40";
const AMBER = "#FFB020";
const WHITE = "#FFFFFF";
const ROOF = "#AA2222";
const STEEL = "#777777";
const PIPE = "#444444";

const DECK_Y = 1;
// Deck gear runs from the bridge front (x=-2.25) to x=2.1, leaving the
// foredeck clear around the mast (a tanker's bow carries only mast + light).
const RUN_START = -2.25;
const RUN_END = 2.1;
const RUN_LEN = RUN_END - RUN_START;
const RUN_MID = (RUN_START + RUN_END) / 2;

const TANK_LIDS_X = [2.5, 1.3, 0.1, -1.1, -2.3];
const VALVES_X = [2, -0.5, -2]; // between lids, never overlapping one
const SIDES = [1, -1] as const;

const HULL_EXTRUDE = { depth: 1, bevelEnabled: false };

type Props = {
  ref?: Ref<Group>;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export default function Boat({ ref, position, rotation }: Props) {
  const lightMat = useRef<MeshStandardMaterial>(null);
  const parts = useRef<Group>(null);

  // Every part casts and receives shadows (cabin/vents shade the deck)
  useLayoutEffect(() => {
    parts.current?.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, []);

  // Top-down tanker outline: square stern at -X, pointed bow at +X, beam ±0.7
  const hullShape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-4, -0.7);
    s.lineTo(3, -0.7);
    s.lineTo(4, -0.3);
    s.lineTo(4.3, 0);
    s.lineTo(4, 0.3);
    s.lineTo(3, 0.7);
    s.lineTo(-4, 0.7);
    s.lineTo(-4, -0.7);
    return s;
  }, []);

  // Masthead light: slow pulse on opacity + emissive
  useFrame(({ clock }) => {
    const m = lightMat.current;
    if (!m) return;
    const t = (Math.sin(clock.elapsedTime * 3) + 1) / 2; // 0..1
    m.opacity = 0.4 + 0.6 * t;
    m.emissiveIntensity = 0.5 + 2 * t;
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <group ref={parts}>
      {/* Hull: outline extruded along Z, rotated so it rises from y=0 to y=1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <extrudeGeometry args={[hullShape, HULL_EXTRUDE]} />
        <meshStandardMaterial color={HULL} />
      </mesh>

      {/* Yellow deck stripe */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[7.8, 0.05, 0.3]} />
        <meshStandardMaterial color={AMBER} />
      </mesh>

      {/* Tank lids — seated on top of the stripe so it doesn't cover them */}
      {TANK_LIDS_X.map((x) => (
        <mesh key={x} position={[x, 1.115, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 16]} />
          <meshStandardMaterial color={STEEL} />
        </mesh>
      ))}

      {/* Cargo valves */}
      {VALVES_X.map((x) => (
        <mesh key={x} position={[x, 1.1, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.5]} />
          <meshStandardMaterial color={AMBER} />
        </mesh>
      ))}

      {/* Cargo pipelines (inboard) + raised walkways (outboard), port & starboard */}
      {SIDES.map((side) => (
        <group key={side}>
          <mesh position={[RUN_MID, 1.1, 0.4 * side]}>
            <boxGeometry args={[RUN_LEN, 0.1, 0.1]} />
            <meshStandardMaterial color={PIPE} />
          </mesh>
          <mesh position={[RUN_MID, 1.15, 0.6 * side]}>
            <boxGeometry args={[RUN_LEN, 0.08, 0.15]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
        </group>
      ))}

      {/* Bridge (aft) + red roof */}
      <mesh position={[-3, 1.6, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.3]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[-3, 2.3, 0]}>
        <boxGeometry args={[1.6, 0.15, 1.4]} />
        <meshStandardMaterial color={ROOF} />
      </mesh>

      {/* Foremast + pulsing masthead light */}
      <mesh position={[3.5, DECK_Y + 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[3.5, 3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial ref={lightMat} color={AMBER} emissive={AMBER} transparent />
      </mesh>

      </group>
    </group>
  );
}
