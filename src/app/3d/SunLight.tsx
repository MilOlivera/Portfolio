"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { DirectionalLight } from "three";
import { useBoatTelemetry } from "./BoatTelemetry";
import { SUN_POSITION } from "./environment";

const SHADOW_EXTENT = 6; // half-size of the shadow box around the boat

// Warm side sun. It keeps the same direction as the <Sky /> sun but travels
// with the boat, so the small shadow camera always covers the vessel.
export default function SunLight() {
  const telemetry = useBoatTelemetry();
  const light = useRef<DirectionalLight>(null);

  useFrame(() => {
    const l = light.current;
    if (!l) return;
    const { x, z } = telemetry.current;
    l.position.set(x + SUN_POSITION[0], SUN_POSITION[1], z + SUN_POSITION[2]);
    l.target.position.set(x, 0, z);
    l.target.updateMatrixWorld();
  });

  return (
    <directionalLight
      ref={light}
      position={SUN_POSITION}
      intensity={1.5}
      color="#ffddb0"
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0005}
      shadow-camera-left={-SHADOW_EXTENT}
      shadow-camera-right={SHADOW_EXTENT}
      shadow-camera-top={SHADOW_EXTENT}
      shadow-camera-bottom={-SHADOW_EXTENT}
      shadow-camera-near={1}
      shadow-camera-far={400}
    />
  );
}
