// Route rules by position: regulatory speed limits, prohibition zones and the
// HUD zone name. Pure data (no three.js) — read by the physics and the HUD.
import { kmToZ, knotsToUps, zToKm } from "./scale";

// GNL Escobar safety area around the FSRU (the 4 yellow buoys, z 135–165).
export const GNL_ZONE = { fromZ: 135, toZ: 165 };

/** Speed limits by world Z (the route runs monotonically +Z downstream). */
const SPEED_ZONES: { fromZ: number; toZ: number; kn: number; label: string }[] = [
  { fromZ: -Infinity, toZ: kmToZ(97.5), kn: 3, label: "km 97.5–114 · velocidad mínima de gobierno" },
  { fromZ: GNL_ZONE.fromZ, toZ: GNL_ZONE.toZ, kn: 3, label: "zona GNL Escobar" },
  { fromZ: kmToZ(48), toZ: kmToZ(40), kn: 8, label: "Canal Mitre km 48–40" },
];
const DEFAULT_KN = 10;
/** Outside the dredged fairway the hull "scrapes": bajo fondo. */
export const OFF_FAIRWAY_KN = 3;

/** Max speed (knots and u/s) at world Z. */
export function speedLimitAt(z: number) {
  const zone = SPEED_ZONES.find((s) => z >= s.fromZ && z < s.toZ);
  const kn = zone?.kn ?? DEFAULT_KN;
  return { kn, ups: knotsToUps(kn) };
}

/** Prohibition / caution bands drawn on the water (ZoneBands.tsx). */
export const ZONE_BANDS = [
  { id: "no-giro", fromZ: kmToZ(97.5), toZ: kmToZ(96), color: "#d9342c", text: "NO GIRO · AGUAS ABAJO O ARRIBA" },
  { id: "gnl", fromZ: GNL_ZONE.fromZ, toZ: GNL_ZONE.toZ, color: "#F7D417", text: "ZONA GNL · PRECAUCIÓN" },
] as const;

/** Stretch names downstream, for the HUD "ZONA" line: [up to this z, name]. */
const ZONES: [toZ: number, name: string][] = [
  [kmToZ(99), "VUELTA DEL ESTE"],
  [kmToZ(97.5), "KM 98 · BOYA VERDE DE GIRO"],
  [kmToZ(96), "CAMPANA · PROHIBIDO GIRAR"],
  [52, "VUELTA CAMPANA"],
  [85, "VUELTA HINOJO"],
  [116, "VUELTA TORDILLO"],
  [GNL_ZONE.fromZ, "CANCHA LARGA"],
  [GNL_ZONE.toZ, "GNL EXPEDIENT"],
  [188, "PUERTO ESCOBAR"],
  [212, "PARANÁ DE LAS PALMAS"],
  [224, "CANAL GOB. LA SERNA"],
  [240, "PARANÁ DE LAS PALMAS"],
  [265, "PNA LIMA · CANAL DE LA HONDA"],
  [383, "CANAL MITRE"],
  [410, "CANAL MITRE · AEROPARQUE"],
  [455, "CANAL MITRE"],
  [470, "CANAL BROWN"],
  [528, "ZONA COMÚN"],
  [540, "CANAL BROWN"],
  [556, "MALECONES LA PLATA"],
  [Infinity, "TEC PLATA"],
];
/** Puerto La Plata keeps its own kilometre posts: the malecones read km 8.7. */
const LA_PLATA = { fromZ: 540, km: 8.7 };

export function zoneAt(z: number) {
  const inPort = z >= LA_PLATA.fromZ;
  const km = inPort ? LA_PLATA.km : Math.max(0, zToKm(z));
  return {
    km,
    /** Set where the km isn't the river's: whose posts it counts. */
    kmRef: inPort ? "Puerto La Plata" : "",
    name: ZONES.find(([toZ]) => z < toZ)![1],
  };
}
