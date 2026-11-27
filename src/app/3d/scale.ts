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
 * rudder, current). Turning radii don't change with it, and the HUD keeps
 * reading the true knots.
 */
export const TIME_SCALE = 2;

// Official kilometre posts (Paraná de las Palmas / Canal Mitre) ↔ world Z.
// Distances are COMPRESSED (~12×) so the voyage fits in a few minutes: each
// landmark keeps its real km label, the stretches between them are shortened.
// Piecewise-linear through the route's anchor points (km descending, z rising).
// Each z is where the landmark is abeam, so the HUD reads what its sign says.
// Past the Zona Común the HUD switches to Puerto La Plata's own posts
// (route-info.ts).
const KM_ANCHORS: [km: number, z: number][] = [
  [107, -104], // Zárate–Brazo Largo bridge
  [101, -52], // Vuelta del Este
  [98, -22], // green turning buoy
  [97, 0], // B/T NANY berth (Terminal AXION, Campana)
  [95, 35], // Vuelta Campana (apex)
  [90, 69], // Vuelta Hinojo (apex)
  [80, 101], // Vuelta Tordillo (apex)
  [74.5, 150], // FSRU EXPEDIENT · GNL Escobar
  [73, 175], // Puerto Escobar
  [50, 250], // PNA LIMA · Canal de la Honda
  [48, 275], // start of the Canal Mitre
  [38, 335],
  [20, 395], // Aeroparque
  [12, 455], // fork: end of the Canal Mitre, start of Canal Brown
  [4, 650], // arriving at the Zona Común
  [2, 680], // Zona Común
  [0, 750], // port entrance
];

function lerpTable(v: number, from: 0 | 1, to: 0 | 1, descending: boolean) {
  const t = KM_ANCHORS;
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
