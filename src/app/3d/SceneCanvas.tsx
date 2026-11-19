"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import Boat from "./Boat";
import BoatControls from "./BoatControls";
import CameraRig from "./CameraRig";

// Three.js materials can't read Tailwind tokens, so scene colors are hex
// (same exception as the ImageResponse icons). #25DB79 = --green.
export default function SceneCanvas() {
  const boatRef = useRef<Group>(null);

  return (
    <Canvas
      camera={{ position: [-3, 2.5, 0], fov: 70 }}
      dpr={[1, 2]}
      style={{ width: "100vw", height: "100vh" }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      <gridHelper args={[100, 100, "#25DB79", "#1a1f1c"]} />

      {/* River placeholder */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3a2515" />
      </mesh>

      <Boat ref={boatRef} />

      {/* Order matters: controls move the boat before the camera reads it each frame */}
      <BoatControls boatRef={boatRef} />
      <CameraRig boatRef={boatRef} />

      <axesHelper args={[5]} />
    </Canvas>
  );
}
