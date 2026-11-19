import { CatmullRomCurve3, Vector3 } from "three";

// Geometric source of truth for the river (1 km = 2 units, -Z = north).
// Terrain (Shoreline.tsx) and collision (BoatControls.tsx) both read the
// signed-distance functions below, so what you see is exactly what blocks you.

// Centerline key points. Tight bends = the real vueltas (Campana, Hinojo, Tordillo).
export const RIVER_CENTERLINE = [
  // Paraná de las Palmas — winding
  new Vector3(0, 0, -2), // Campana AXION (origin, berth)
  new Vector3(3, 0, 8), // Vuelta de Campana
  new Vector3(10, 0, 18),
  new Vector3(16, 0, 28),
  new Vector3(22, 0, 38), // ~Escobar
  new Vector3(26, 0, 48), // into the Hinojo
  new Vector3(32, 0, 52), // Vuelta del Hinojo
  new Vector3(40, 0, 54),
  new Vector3(45, 0, 58), // Vuelta del Tordillo
  new Vector3(52, 0, 59),
  new Vector3(60, 0, 60), // end of the Paraná, fork toward the Mitre
  // Canal Emilio Mitre — nearly straight
  new Vector3(70, 0, 70),
  new Vector3(85, 0, 89), // Km 12 Puerto BA
  // Canal Brown toward La Plata (SE)
  new Vector3(130, 0, 105),
  new Vector3(170, 0, 120),
  new Vector3(203, 0, 133), // Zona Común (destination)
];

export const RIVER_CURVE = new CatmullRomCurve3(RIVER_CENTERLINE, false, "catmullrom", 0.5);

/** Navigable channel width (units). */
export const RIVER_WIDTH = 16;
const HALF_WIDTH = RIVER_WIDTH / 2;

// ------------------------------------------------------------- samples ----
// Arc-length samples of the curve as flat arrays (no per-query allocation).
const SAMPLES = 240;
const main = RIVER_CURVE.getSpacedPoints(SAMPLES);
const MAIN_X = Float64Array.from(main, (p) => p.x);
const MAIN_Z = Float64Array.from(main, (p) => p.z);

// Paraná upstream of Campana, up to and past the Zárate–Brazo Largo bridge
// (Km 100, z=-80). Not part of the route — the world bound stops you at z=-70,
// so the bridge stays a far silhouette.
const UP_X = Float64Array.of(0, -1, -4, -30, -30, -30);
const UP_Z = Float64Array.of(-2, -25, -50, -70, -90, -120);

// --------------------------------------------------------------- zones ----
// Turning basin off the Campana berth: the boat's turning radius (~10 u) is
// wider than half the channel, so the "caída" needs room. Verified by
// simulation: undock → caída a estribor → full route clears every bank.
const BASIN = { x: 8, z: 4, r: 18 };
// East berths across the basin (STENA IMAGE, CALETA ROSARIO), clear of the
// caída's turning circle.
const BERTHS_EAST = { x: 32, z: 0, r: 14 };
// Zona Común anchorage (open water around the destination ships).
const ANCHORAGE = { x: 205, z: 135, r: 26 };
// Campana quay, alongside the boat's port (west) side, running north past
// the KHAN / DELTAMAR berths. Land, carved out of any water above.
export const QUAY = { minX: -16, maxX: -2.5, minZ: -45, maxZ: 6 };
// Delta del Paraná side channels: visible water behind a land strip, not
// navigable (islands live here — DeltaIslands.tsx).
const DELTA = { minX: 2, maxX: 50, minZ: 62, maxZ: 108 };
const DELTA_LAND_STRIP = 5; // land kept between the channel bank and the delta

function segDist(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (pz - az) * dz) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = px - ax - t * dx;
  const ez = pz - az - t * dz;
  return Math.sqrt(ex * ex + ez * ez);
}

function polylineDist(px: number, pz: number, xs: Float64Array, zs: Float64Array) {
  let best = Infinity;
  for (let i = 0; i < xs.length - 1; i++) {
    const d = segDist(px, pz, xs[i], zs[i], xs[i + 1], zs[i + 1]);
    if (d < best) best = d;
  }
  return best;
}

type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

/** Signed distance to an axis-aligned rect (negative inside). */
function rectSd(px: number, pz: number, r: Rect) {
  const qx = Math.abs(px - (r.minX + r.maxX) / 2) - (r.maxX - r.minX) / 2;
  const qz = Math.abs(pz - (r.minZ + r.maxZ) / 2) - (r.maxZ - r.minZ) / 2;
  const ox = Math.max(qx, 0);
  const oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oz * oz) + Math.min(Math.max(qx, qz), 0);
}

/** Distance from (x,z) to the river centerline (main route + upstream). */
export function centerlineDistance(x: number, z: number) {
  return Math.min(polylineDist(x, z, MAIN_X, MAIN_Z), polylineDist(x, z, UP_X, UP_Z));
}

/**
 * Signed distance to navigable water: negative = water you can sail
 * (channel ∪ turning basin ∪ anchorage, minus the quay), positive = land.
 */
export function navigableSd(x: number, z: number) {
  const channel = centerlineDistance(x, z) - HALF_WIDTH;
  const basin = Math.min(
    Math.hypot(x - BASIN.x, z - BASIN.z) - BASIN.r,
    Math.hypot(x - BERTHS_EAST.x, z - BERTHS_EAST.z) - BERTHS_EAST.r,
  );
  const anchorage = Math.hypot(x - ANCHORAGE.x, z - ANCHORAGE.z) - ANCHORAGE.r;
  return Math.max(Math.min(channel, basin, anchorage), -rectSd(x, z, QUAY));
}

/** Signed distance to any visible water (navigable + Delta side channels). */
export function waterSd(x: number, z: number) {
  const delta = Math.max(rectSd(x, z, DELTA), HALF_WIDTH + DELTA_LAND_STRIP - centerlineDistance(x, z));
  return Math.min(navigableSd(x, z), delta);
}

/**
 * Point on the bank beside (x,z): the foot on the centerline pushed sideways
 * by `offset` (or further, until it's solid land), on whichever side is land.
 * Used for the vuelta signs.
 */
const LAND_CLEARANCE = 1.5;

export function bankPoint(x: number, z: number, offset: number): [number, number] {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < SAMPLES; i++) {
    const d = segDist(x, z, MAIN_X[i], MAIN_Z[i], MAIN_X[i + 1], MAIN_Z[i + 1]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  const tx = MAIN_X[best + 1] - MAIN_X[best];
  const tz = MAIN_Z[best + 1] - MAIN_Z[best];
  const len = Math.hypot(tx, tz) || 1;
  const nx = -tz / len;
  const nz = tx / len;
  // Step outward until one side is solid land (the Campana basin widens the
  // water there, so a fixed offset can still land in it).
  let pick: [number, number] = [x + nx * offset, z + nz * offset];
  for (let o = offset; o <= offset + 24; o += 1) {
    const a: [number, number] = [x + nx * o, z + nz * o];
    const b: [number, number] = [x - nx * o, z - nz * o];
    const sa = navigableSd(a[0], a[1]);
    const sb = navigableSd(b[0], b[1]);
    pick = sa >= sb ? a : b;
    if (Math.max(sa, sb) >= LAND_CLEARANCE) break;
  }
  return pick;
}
