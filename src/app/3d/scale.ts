// World scale for the 3D river (pure numbers, no three.js — safe for the DOM HUD).

/** 1 unit = 20 real metres. */
export const METERS_PER_UNIT = 20;
export const KM_PER_UNIT = METERS_PER_UNIT / 1000; // 0.02
export const UNITS_PER_KM = 1000 / METERS_PER_UNIT; // 50

/**
 * Game time runs this many times faster than real time for MOVEMENT, so the
 * regulatory speeds read true in knots while the trip stays playable:
 * 10 kn → 5.14 u/s (instead of a real-time 0.26 u/s).
 */
export const TIME_SCALE = 20;

/** Knots → units/second (with TIME_SCALE). 10 kn = 5.144 u/s. */
export const KT_TO_UPS = (0.5144 / METERS_PER_UNIT) * TIME_SCALE;

// Official kilometre posts (Paraná de las Palmas / Canal Mitre) ↔ world Z.
// The berth is km 97 at z = 0; downstream = +Z, km decreasing. Linear fit of
// the route's z per km (the river winds, so arc length is a bit longer).
const UNITS_Z_PER_KM = 54.1;

export function kmToZ(km: number) {
  return (97 - km) * UNITS_Z_PER_KM;
}

export function zToKm(z: number) {
  return 97 - z / UNITS_Z_PER_KM;
}

export const upsToKnots = (ups: number) => ups / KT_TO_UPS;
export const knotsToUps = (kn: number) => kn * KT_TO_UPS;
