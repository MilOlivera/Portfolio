// Decorative navigation buoys (no collision, no CTA), placed against the
// river geometry. 3D-side only (imports three via river-geometry).
import { besideRiver } from "./river-geometry";
import { kmToZ } from "./scale";
import { TURN_BUOY } from "./waypoints-data";

export type NavBuoyKind = "red" | "green" | "yellow";
export type NavBuoy = { id: string; kind: NavBuoyKind; pos: [number, number, number]; label?: string };

// Canal Emilio Mitre lateral pairs, 4 u (80 m) each side of the centerline —
// just outside the 150 m dredged lane. IALA Region B: red to starboard when
// ENTERING (sailing upstream from the Zona Común), so for the player sailing
// downstream RED is to PORT = east side, GREEN to starboard = west.
const MITRE_PAIRS_KM = [44, 40, 36, 32, 28, 20, 14];
const LATERAL_OFFSET = 4;
const RED_SIDE = "east" as "west" | "east"; // flip to "west" to mirror the pairs
const RED_SIGN = RED_SIDE === "west" ? 1 : -1; // besideRiver: + = west, − = east

const mitrePairs: NavBuoy[] = MITRE_PAIRS_KM.flatMap((km) => {
  const z = kmToZ(km);
  const [rx, rz] = besideRiver(z, RED_SIGN * LATERAL_OFFSET);
  const [gx, gz] = besideRiver(z, -RED_SIGN * LATERAL_OFFSET);
  return [
    { id: `mitre-r-${km}`, kind: "red" as const, pos: [rx, 0, rz] as [number, number, number] },
    { id: `mitre-g-${km}`, kind: "green" as const, pos: [gx, 0, gz] as [number, number, number] },
  ];
});

// GNL Escobar turning area (km 75.5–76.5): yellow special marks, St Andrew's
// cross topmark (Disposición SNAV NA9 N° 004/11).
const gnlBuoys: NavBuoy[] = (
  [
    [55, 1070],
    [65, 1090],
    [75, 1110],
    [65, 1130],
  ] as const
).map(([x, z], i) => ({ id: `gnl-${i}`, kind: "yellow", pos: [x, 0, z] }));

export const NAV_BUOYS: NavBuoy[] = [
  { id: "turn-buoy", kind: "green", pos: TURN_BUOY, label: "BOYA VERDE · KM 98" },
  ...mitrePairs,
  ...gnlBuoys,
];
