"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

// Three.js materials can't read Tailwind tokens, so scene colors are hex
// (same exception as the ImageResponse icons). #25DB79 = --green.
export default function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [5, 5, 10], fov: 60 }}
      dpr={[1, 2]}
      style={{ width: "100vw", height: "100vh" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      <gridHelper args={[50, 50, "#25DB79", "#1a1f1c"]} />

      {/* River placeholder */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a2515" />
      </mesh>

      {/* Vessel placeholder */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1, 1.5]} />
        <meshStandardMaterial color="#25DB79" />
      </mesh>

      <OrbitControls />
      <axesHelper args={[5]} />
    </Canvas>
  );
}
