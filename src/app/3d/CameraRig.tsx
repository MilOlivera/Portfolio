"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import { PerspectiveCamera, Vector3, type Group } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const UP = new Vector3(0, 1, 0);
const BRIDGE_OFFSET = new Vector3(-1.2, 1.6, 0); // above the bridge roof (y≈1.07), at its forward edge
const LOOK_OFFSET = new Vector3(7.5, 0, 0); // ahead at water level: deck below, horizon above
const ORBIT_START_OFFSET = new Vector3(-7, 3.5, 3); // aft-quarter view
const FOV = 80;

// Scratch vectors reused every frame (no per-frame allocation)
const tmp = new Vector3();
const tmpLook = new Vector3();

export type CameraMode = "fps" | "orbit";

export default function CameraRig({ boatRef }: { boatRef: RefObject<Group | null> }) {
  const camera = useThree((s) => s.camera);
  const [mode, setMode] = useState<CameraMode>("fps");
  const controls = useRef<OrbitControlsImpl>(null);
  const lastBoatPos = useRef(new Vector3());

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = FOV;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "KeyV" || e.repeat) return;
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, [contenteditable]")) return;
      setMode((m) => (m === "fps" ? "orbit" : "fps"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Entering orbit: start from an aft-quarter view of the boat
  useEffect(() => {
    const boat = boatRef.current;
    if (mode !== "orbit" || !boat) return;
    tmp.copy(ORBIT_START_OFFSET).applyAxisAngle(UP, boat.rotation.y).add(boat.position);
    camera.position.copy(tmp);
    lastBoatPos.current.copy(boat.position);
  }, [mode, camera, boatRef]);

  useFrame(() => {
    const boat = boatRef.current;
    if (!boat) return;
    const heading = boat.rotation.y;

    if (mode === "fps") {
      tmp.copy(BRIDGE_OFFSET).applyAxisAngle(UP, heading).add(boat.position);
      camera.position.copy(tmp);
      tmpLook.copy(LOOK_OFFSET).applyAxisAngle(UP, heading).add(boat.position);
      camera.lookAt(tmpLook);
      return;
    }

    // Orbit follow-cam: carry the camera along with the boat, keep target on it
    const c = controls.current;
    if (!c) return;
    tmp.subVectors(boat.position, lastBoatPos.current);
    camera.position.add(tmp);
    lastBoatPos.current.copy(boat.position);
    c.target.set(boat.position.x, boat.position.y + 1, boat.position.z);
    c.update();
  });

  return mode === "orbit" ? (
    <OrbitControls ref={controls} enablePan={false} minDistance={3} maxDistance={30} maxPolarAngle={Math.PI / 2 - 0.05} />
  ) : null;
}
