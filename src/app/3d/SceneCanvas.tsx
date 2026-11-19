"use client";

import { Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import Boat from "./Boat";
import BoatControls from "./BoatControls";
import CameraRig from "./CameraRig";
import DeltaIslands from "./DeltaIslands";
import { FOG_FAR, FOG_NEAR, HORIZON_HEX, SUN_POSITION } from "./environment";
import Shoreline from "./Shoreline";
import SunLight from "./SunLight";
import Water from "./Water";
import Waypoints from "./Waypoints";
import ZarateBridge from "./ZarateBridge";

// Three.js materials can't read Tailwind tokens, so scene colors are hex.
export default function SceneCanvas() {
  const boatRef = useRef<Group>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [-2.5, 3.5, 0], fov: 80 }}
      dpr={[1, 2]}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Hazy Río de la Plata day: loaded atmosphere, low warm side sun */}
      <Sky
        distance={450000}
        sunPosition={SUN_POSITION}
        mieCoefficient={0.015}
        mieDirectionalG={0.8}
        rayleigh={2.5}
        turbidity={6}
      />
      <fog attach="fog" args={[HORIZON_HEX, FOG_NEAR, FOG_FAR]} />

      <ambientLight intensity={0.6} color="#fff5e0" />
      <SunLight />

      <Water />
      <Shoreline />
      <DeltaIslands />
      <ZarateBridge />
      <Waypoints />
      <Boat ref={boatRef} />

      {/* Order matters: controls move the boat before the camera reads it each frame */}
      <BoatControls boatRef={boatRef} />
      <CameraRig boatRef={boatRef} />
    </Canvas>
  );
}
