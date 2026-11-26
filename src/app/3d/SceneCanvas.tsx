"use client";

import { Sky } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import Boat from "./Boat";
import BoatControls from "./BoatControls";
import CameraRig from "./CameraRig";
import DeltaCanals from "./DeltaCanals";
import DeltaHouses from "./DeltaHouses";
import DeltaIslands from "./DeltaIslands";
import NavBuoys from "./NavBuoys";
import { FOG_FAR, FOG_NEAR, HORIZON_HEX, SUN_POSITION } from "./environment";
import FSRUExpedient from "./FSRUExpedient";
import Gasoducto from "./Gasoducto";
import GNLEscobar from "./GNLEscobar";
import LoadingArms from "./LoadingArms";
import PuertoEscobar from "./PuertoEscobar";
import RefineryPAE from "./RefineryPAE";
import RelocatedLandmarks from "./Relocated";
import Shoreline from "./Shoreline";
import SunLight from "./SunLight";
import Water from "./Water";
import Waypoints from "./Waypoints";
import ZarateBridge from "./ZarateBridge";
import ZonaComunPolygons from "./ZonaComunPolygons";
import ZoneBands from "./ZoneBands";

// Three.js materials can't read Tailwind tokens, so scene colors are hex.
export default function SceneCanvas() {
  const boatRef = useRef<Group>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.6, 1.2], fov: 80, far: 600 }} // far: the km 106 bridge (~450 u) stays visible; farther decor is culled
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
      <ZoneBands />

      {/* Route, upstream → downstream (scenery far from the boat is fogged out) */}
      <ZarateBridge />
      <RefineryPAE />
      <LoadingArms />
      <DeltaIslands />
      <DeltaHouses />
      <DeltaCanals />
      <PuertoEscobar />
      <GNLEscobar />
      <FSRUExpedient />
      <RelocatedLandmarks />

      <Waypoints />
      <NavBuoys />
      <ZonaComunPolygons />
      <Gasoducto />
      <Boat ref={boatRef} />

      {/* Order matters: controls move the boat before the camera reads it each frame */}
      <BoatControls boatRef={boatRef} />
      <CameraRig boatRef={boatRef} />
    </Canvas>
  );
}
