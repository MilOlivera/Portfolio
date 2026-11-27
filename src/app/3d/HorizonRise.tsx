"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, useState, type ReactNode } from "react";
import type { Group } from "three";
import { useBoatTelemetry } from "./BoatTelemetry";

// The city and port skylines to the south (Aeroparque, Puerto BA, La Plata).
// Past the fog they would still stand out as flat silhouettes against the sky,
// over the Delta between Puerto Escobar and PNA LIMA. So they're only there
// from PNA LIMA on, rising out of the horizon haze into the Canal Mitre.
const FROM_Z = 250;
const TO_Z = 285;

export default function HorizonRise({ children }: { children: ReactNode }) {
  const telemetry = useBoatTelemetry();
  const group = useRef<Group>(null);
  // Mounted, not just hidden: DOM labels ignore a parent's `visible`
  const [mounted, setMounted] = useState(false);

  useFrame(() => {
    const t = Math.max(0, Math.min(1, (telemetry.current.z - FROM_Z) / (TO_Z - FROM_Z)));
    if (t > 0 !== mounted) setMounted(t > 0);
    group.current?.scale.setY(Math.max(t * t * (3 - 2 * t), 0.001));
  });

  return <group ref={group}>{mounted && children}</group>;
}
