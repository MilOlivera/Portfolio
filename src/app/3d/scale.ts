// World scale for the 3D river (pure numbers, no three.js — safe for the DOM HUD).

/** 1 unit = 20 real metres. */
export const METERS_PER_UNIT = 20;
export const KM_PER_UNIT = METERS_PER_UNIT / 1000; // 0.02
export const UNITS_PER_KM = 1000 / METERS_PER_UNIT; // 50

/**
 * Speed compression of the handling model: ship speeds are modelled 20× their
 * real-time value so 10 kn = 5.144 u/s. Acceleration, rudder and turning
 * radius are tuned in these units (validated by simulation) — don't change.
 */
const HANDLING_COMPRESSION = 20;

/** Knots → units/second of simulation time. 10 kn = 5.144 u/s. */
export const KT_TO_UPS = (0.5144 / METERS_PER_UNIT) * HANDLING_COMPRESSION;

/**
 * Fast-forward: the whole ship simulation (movement, acceleration, rudder,
 * current) runs this many times faster than the clock, so the 5.5 km route
 * takes ~5 min. Turning radii are unchanged and the HUD keeps reading the
 * true knots (10 kn cruise).
 */
export const TIME_SCALE = 4;

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
