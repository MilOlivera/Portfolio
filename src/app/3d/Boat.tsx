"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type Ref } from "react";
import type { Group, MeshStandardMaterial } from "three";

// B/T NANY low-poly (83 × 13.8 m, ~6:1). Bow points to +X, stern (bridge) to -X.
// Three.js materials can't read CSS tokens, so colors are hex.
const HULL = "#1a7a40";
const AMBER = "#FFB020";
const WHITE = "#FFFFFF";
const ROOF = "#AA2222";

type Props = {
  ref?: Ref<Group>;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export default function Boat({ ref, position, rotation }: Props) {
  const lightMat = useRef<MeshStandardMaterial>(null);

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
      {/* Hull */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[8, 1, 1.4]} />
        <meshStandardMaterial color={HULL} />
      </mesh>

      {/* Yellow deck stripe */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[7.8, 0.05, 0.3]} />
        <meshStandardMaterial color={AMBER} />
      </mesh>

      {/* Raised catwalk */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[7, 0.08, 0.25]} />
        <meshStandardMaterial color={AMBER} transparent opacity={0.6} />
      </mesh>

      {/* Bridge (aft) + red roof */}
      <mesh position={[-3, 1.6, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.3]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[-3, 2.3, 0]}>
        <boxGeometry args={[1.6, 0.15, 1.4]} />
        <meshStandardMaterial color={ROOF} />
      </mesh>

      {/* Mast + pulsing masthead light */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2, 8]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial ref={lightMat} color={AMBER} emissive={AMBER} transparent />
      </mesh>

      {/* Bow ventilators, port + starboard */}
      {[0.5, -0.5].map((z) => (
        <mesh key={z} position={[2.5, 1, z]}>
          <cylinderGeometry args={[0.25, 0.3, 0.8, 12]} />
          <meshStandardMaterial color={WHITE} />
        </mesh>
      ))}
    </group>
  );
}
