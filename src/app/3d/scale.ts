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
 * Clock multiplier for the whole ship simulation (movement, acceleration,
 * rudder, current). Calibrated by simulation on the compressed route
 * (~430 u): flat out with an autopilot the voyage takes ~3.8 min, so a
 * player — careful turns, stopping to read the modals — lands at ~4–5 min.
 * (>1 would make it shorter: at 6 the whole trip lasts ~20 s.) Turning radii
 * don't change with it, and the HUD keeps reading the true knots.
 */
export const TIME_SCALE = 0.5;

// Official kilometre posts (Paraná de las Palmas / Canal Mitre) ↔ world Z.
// Distances are COMPRESSED (~12×) so the voyage fits in a few minutes: each
// landmark keeps its real km label, the stretches between them are shortened.
// Piecewise-linear through the route's anchor points (km descending, z rising).
const KM_Z: [km: number, z: number][] = [
  [107, -60], // Zárate–Brazo Largo bridge
  [101, -40], // Vuelta del Este
  [98, -15], // green turning buoy
  [97, 0], // B/T NANY berth (Terminal AXION, Campana)
  [95, 25], // Vuelta de Campana
  [90, 35], // Vuelta del Hinojo
  [80, 50], // Vuelta del Tordillo
  [77, 90], // Puerto Escobar
  [74.5, 110], // FSRU EXPEDIENT · GNL Escobar
  [70, 130],
  [50, 170], // PNA LIMA · Canal de la Honda
  [48, 190], // start of the Canal Mitre
  [38, 250],
  [20, 310], // Aeroparque
  [12, 370], // end of the Canal Mitre
  [2, 420], // Zona Común
];

function lerpTable(v: number, from: 0 | 1, to: 0 | 1, descending: boolean) {
  const t = KM_Z;
  const first = t[0][from];
  const last = t[t.length - 1][from];
  const before = descending ? v > first : v < first;
  const after = descending ? v < last : v > last;
  const i = before ? 0 : after ? t.length - 2 : t.findIndex((r, k) => k < t.length - 1 && (descending ? v <= r[from] && v >= t[k + 1][from] : v >= r[from] && v <= t[k + 1][from]));
  const a = t[i];
  const b = t[i + 1];
  return a[to] + ((v - a[from]) / (b[from] - a[from])) * (b[to] - a[to]);
}

export function kmToZ(km: number) {
  return lerpTable(km, 0, 1, true);
}

export function zToKm(z: number) {
  return lerpTable(z, 1, 0, false);
}

export const upsToKnots = (ups: number) => ups / KT_TO_UPS;
export const knotsToUps = (kn: number) => kn * KT_TO_UPS;
