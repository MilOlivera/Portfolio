// Decorative navigation buoys (no collision, no CTA), placed against the
// river geometry. 3D-side only (imports three via river-geometry).
import { besideRiver } from "./river-geometry";
import { TURN_BUOY } from "./waypoints-data";

export type NavBuoyKind = "red" | "green" | "yellow";
export type NavBuoy = {
  id: string;
  kind: NavBuoyKind;
  pos: [number, number, number];
  label?: string;
  pulseHz?: number; // smooth pulse at this rate instead of the default character
};

// Canal Emilio Mitre lateral pairs, 4 u (80 m) each side of the centerline —
// just outside the 150 m dredged lane — evenly spaced along the buoyed run.
// IALA Region B: red to starboard when ENTERING (sailing upstream from the
// Zona Común), so for the player sailing downstream RED is to PORT = east
// side, GREEN to starboard = west.
const MITRE_PAIRS = 15;
const MITRE_Z_START = 280;
const MITRE_Z_END = 438; // short of the km 12 fork
const LATERAL_OFFSET = 4;
export const RED_SIDE = "east" as "east" | "west"; // flip to "west" to mirror the pairs
const RED_SIGN = RED_SIDE === "west" ? 1 : -1; // besideRiver: + = west, − = east

// GNL Escobar safety perimeter around the FSRU EXPEDIENT: yellow special
// marks, St Andrew's cross topmark (Disposición SNAV NA9 N° 004/11).
const gnlBuoys: NavBuoy[] = (
  [
    [135, 7],
    [135, -7],
    [165, -7],
    [165, 7],
  ] as const
).map(([z, west], i) => {
  const [x, bz] = besideRiver(z, west);
  return { id: `gnl-${i}`, kind: "yellow", pos: [x, 0, bz] };
});

/** IALA lateral pair astride the centerline at `z` (red on RED_SIDE). */
export function lateralPair(z: number, id: string): NavBuoy[] {
  const [rx, rz] = besideRiver(z, RED_SIGN * LATERAL_OFFSET);
  const [gx, gz] = besideRiver(z, -RED_SIGN * LATERAL_OFFSET);
  return [
    { id: `${id}-r`, kind: "red", pos: [rx, 0, rz] },
    { id: `${id}-g`, kind: "green", pos: [gx, 0, gz] },
  ];
}

export const NAV_BUOYS: NavBuoy[] = [
  { id: "turn-buoy", kind: "green", pos: TURN_BUOY, label: "BOYA VERDE · KM 98" },
  ...Array.from({ length: MITRE_PAIRS }, (_, i) =>
    lateralPair(MITRE_Z_START + (i * (MITRE_Z_END - MITRE_Z_START)) / (MITRE_PAIRS - 1), `mitre-${i}`),
  ).flat(),
  ...gnlBuoys,
];
