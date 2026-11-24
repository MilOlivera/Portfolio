// Route rules by position: regulatory speed limits, prohibition zones and the
// HUD zone name. Pure data (no three.js) — read by the physics and the HUD.
import { kmToZ, knotsToUps, zToKm } from "./scale";

// GNL Escobar safety area around the FSRU (the 4 yellow buoys, z 184–214).
export const GNL_ZONE = { fromZ: 184, toZ: 214 };

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

/** Stretch names by km (descending), for the HUD "ZONA" line. */
const ZONES: { minKm: number; name: string }[] = [
  { minKm: 99, name: "VUELTA DEL ESTE" },
  { minKm: 97.5, name: "KM 98 · BOYA VERDE DE GIRO" },
  { minKm: 96, name: "CAMPANA · PROHIBIDO GIRAR" },
  { minKm: 92, name: "VUELTA DE CAMPANA" },
  { minKm: 86.5, name: "VUELTA DEL HINOJO" },
  { minKm: 83.5, name: "CANAL GOB. ARIAS" },
  { minKm: 78, name: "VUELTA DEL TORDILLO" },
  { minKm: 76.5, name: "CANCHA LARGA · PUERTO ESCOBAR" },
  { minKm: 73.5, name: "GNL ESCOBAR · FSRU EXPEDIENT" },
  { minKm: 71, name: "PARANÁ DE LAS PALMAS" },
  { minKm: 67.5, name: "TRANSFERENCIA DE GRANOS" },
  { minKm: 63.5, name: "CANAL GOB. LA SERNA" },
  { minKm: 51, name: "PARANÁ DE LAS PALMAS" },
  { minKm: 48.5, name: "PNA LIMA · CANAL DE LA HONDA" },
  { minKm: 22, name: "CANAL EMILIO MITRE" },
  { minKm: 17, name: "CANAL MITRE · AEROPARQUE" },
  { minKm: 12, name: "CANAL MITRE · LA PLATA" },
  { minKm: -Infinity, name: "ZONA COMÚN" },
];

export function zoneAt(z: number) {
  const km = zToKm(z);
  return { km, name: ZONES.find((zn) => km >= zn.minKm)?.name ?? "ZONA COMÚN" };
}
