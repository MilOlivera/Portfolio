import { CatmullRomCurve3, Vector3 } from "three";
import { kmToZ } from "./scale";

// Geometric source of truth for the river — official km posts of the Paraná
// de las Palmas and Canal Emilio Mitre (Ordenanza 4-18 DPSN).
// Scale: 1 unit = 20 m (scale.ts). Origin = B/T NANY berth, km 97.
// Axes: +Z downstream (south), -Z upstream (north), +X east = starboard when
// moored bow-north = the Delta bank; -X west = mainland (Campana, Escobar, BA).
//
// Terrain (Shoreline.tsx) and collision (BoatControls.tsx) both read the
// signed-distance functions below, so what you see is exactly what blocks you.

export const RIVER_CENTERLINE = [
  // Upstream reach (not sailed: scenery + Zárate–Brazo Largo bridge)
  new Vector3(50, 0, -500), // km 107 · Zárate–Brazo Largo bridge
  new Vector3(40, 0, -400), // km 105
  new Vector3(30, 0, -200), // km 101 · Vuelta del Este
  new Vector3(15, 0, -100), // km 99 · end of the Vuelta del Este
  new Vector3(10, 0, -40), // km 98 · green turning buoy
  new Vector3(0, 0, 0), // km 97 · B/T NANY berth

  // Downstream (sailed)
  new Vector3(5, 0, 50), // km 96
  new Vector3(15, 0, 200), // km 93
  new Vector3(25, 0, 350), // km 90 · Vuelta del Hinojo
  new Vector3(20, 0, 400), // km 89
  new Vector3(30, 0, 550), // km 85 · Canal Gob. Arias (Delta side)
  new Vector3(45, 0, 800), // km 80 · Vuelta del Tordillo (provisional)
  new Vector3(60, 0, 1050), // km 75.5 · LNG carriers' turning area
  new Vector3(70, 0, 1125), // km 74.5 · off the GNL Escobar jetty
  new Vector3(90, 0, 1250), // km 72
  new Vector3(110, 0, 1400), // km 70 · grain terminal
  new Vector3(125, 0, 1500), // km 68
  new Vector3(160, 0, 1700), // km 65 · Canal Gob. La Serna (Delta side)
  new Vector3(200, 0, 2000), // km 55
  new Vector3(225, 0, 2200), // km 50 · PNA LIMA + Canal de la Honda
  new Vector3(245, 0, 2400), // km 48 · fork into the CANAL MITRE

  // Canal Emilio Mitre (straight, SE, IALA-buoyed)
  new Vector3(280, 0, 2600), // km 44
  new Vector3(320, 0, 2850), // km 40
  new Vector3(360, 0, 3100), // km 36
  new Vector3(400, 0, 3350), // km 32
  new Vector3(440, 0, 3600), // km 28
  new Vector3(480, 0, 3850), // km 24
  new Vector3(520, 0, 4100), // km 20 · Aeroparque to the west
  new Vector3(560, 0, 4350), // km 16
  new Vector3(600, 0, 4600), // km 12 · end of the Canal Mitre

  // Zona Común (anchorage)
  new Vector3(640, 0, 4800),
  new Vector3(680, 0, 5000), // mega Evolvere just beyond
];

export const RIVER_CURVE = new CatmullRomCurve3(RIVER_CENTERLINE, false, "catmullrom", 0.5);

/** Navigable channel width: 7.5 u = 150 m. */
export const RIVER_WIDTH = 7.5;
export const HALF_WIDTH = RIVER_WIDTH / 2;

// ------------------------------------------------------------- samples ----
// Arc-length samples (~4 u apart) as flat arrays, plus per-chunk bounding
// boxes so distance queries skip far stretches. Z grows monotonically along
// the curve, which frameAtZ() relies on.
const SAMPLES = 1400;
const pts = RIVER_CURVE.getSpacedPoints(SAMPLES);
const XS = Float64Array.from(pts, (p) => p.x);
const ZS = Float64Array.from(pts, (p) => p.z);

const CHUNK = 10;
const CHUNKS = Math.ceil(SAMPLES / CHUNK);
const BOX = new Float64Array(CHUNKS * 4); // minX, maxX, minZ, maxZ
for (let c = 0; c < CHUNKS; c++) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = c * CHUNK; i <= Math.min((c + 1) * CHUNK, SAMPLES); i++) {
    minX = Math.min(minX, XS[i]);
    maxX = Math.max(maxX, XS[i]);
    minZ = Math.min(minZ, ZS[i]);
    maxZ = Math.max(maxZ, ZS[i]);
  }
  BOX.set([minX, maxX, minZ, maxZ], c * 4);
}

export type RiverFrame = {
  x: number; // centerline point at this z
  z: number;
  tx: number; // unit tangent, pointing downstream
  tz: number;
  wx: number; // unit normal pointing to the WEST (mainland) bank
  wz: number;
};

/** Centerline point, downstream tangent and west normal at a given world Z. */
export function frameAtZ(z: number): RiverFrame {
  let lo = 0;
  let hi = SAMPLES;
  if (z <= ZS[0]) hi = 1;
  else if (z >= ZS[SAMPLES]) lo = SAMPLES - 1;
  else {
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (ZS[mid] <= z) lo = mid;
      else hi = mid;
    }
  }
  hi = lo + 1;
  const f = Math.max(0, Math.min(1, (z - ZS[lo]) / (ZS[hi] - ZS[lo])));
  const tx0 = XS[hi] - XS[lo];
  const tz0 = ZS[hi] - ZS[lo];
  const len = Math.hypot(tx0, tz0) || 1;
  const tx = tx0 / len;
  const tz = tz0 / len;
  return { x: XS[lo] + tx0 * f, z, tx, tz, wx: -tz, wz: tx };
}

/** Point `offset` units from the centerline at `z`, toward the west (+) or east (−) bank. */
export function besideRiver(z: number, offset: number): [number, number] {
  const f = frameAtZ(z);
  return [f.x + f.wx * offset, f.z + f.wz * offset];
}

// --------------------------------------------------------------- zones ----
type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };
type Circle = { x: number; z: number; r: number };

// Port basin (dársena) west of the berth, where the other ships lie moored.
const DARSENA: Rect = { minX: -20, maxX: -1.8, minZ: -10, maxZ: 20 };
/** Concrete jetty the B/T NANY lies alongside (port side). Land, drawn as a pier. */
export const JETTY: Rect = { minX: -1.8, maxX: -0.8, minZ: -8, maxZ: 10 };
// GNL Escobar turning area (km 75.5–76.5), wide enough for the 4 yellow buoys.
export const GNL_BASIN: Circle = { x: 66, z: 1100, r: 34 };
// Zona Común anchorage.
export const ANCHORAGE: Circle = { x: 690, z: 5040, r: 60 };

// Río de la Plata around the Canal Mitre: open shallow water (visible, not
// navigable — the dredged channel is the only way). Widens from km ~49.
const ESTUARY_START_Z = kmToZ(49.5);
const ESTUARY_FULL_Z = ESTUARY_START_Z + 200;
const ESTUARY_HALF_WIDTH = 70;

// Delta side canals (visible water, not navigable): straight, perpendicular
// to the river toward the east, starting on the centerline.
const CANAL_LENGTH = 130;
const CANAL_HALF_WIDTH = 4;
export const CANALS = [
  { id: "gob-arias", name: "Canal Gob. Arias", z: 700 },
  { id: "gob-laserna", name: "Canal Gob. La Serna", z: 1800 },
  { id: "canal-honda", name: "Canal de la Honda", z: 2350 },
].map((c) => {
  const f = frameAtZ(c.z);
  return { ...c, x0: f.x, z0: f.z, ax: -f.wx, az: -f.wz }; // axis toward the east bank
});

// Delta islands starboard (east) of the berth: side channels behind a strip.
const DELTA_NEAR: Rect = { minX: 13, maxX: 75, minZ: -90, maxZ: 45 };
const DELTA_LAND_STRIP = 4;

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

/** Signed distance to an axis-aligned rect (negative inside). */
function rectSd(px: number, pz: number, r: Rect) {
  const qx = Math.abs(px - (r.minX + r.maxX) / 2) - (r.maxX - r.minX) / 2;
  const qz = Math.abs(pz - (r.minZ + r.maxZ) / 2) - (r.maxZ - r.minZ) / 2;
  const ox = Math.max(qx, 0);
  const oz = Math.max(qz, 0);
  return Math.sqrt(ox * ox + oz * oz) + Math.min(Math.max(qx, qz), 0);
}

const circleSd = (px: number, pz: number, c: Circle) => Math.hypot(px - c.x, pz - c.z) - c.r;

/** Distance from (x,z) to the river centerline. */
export function centerlineDistance(x: number, z: number) {
  let best = Infinity;
  for (let c = 0; c < CHUNKS; c++) {
    const o = c * 4;
    const bx = Math.max(BOX[o] - x, 0, x - BOX[o + 1]);
    const bz = Math.max(BOX[o + 2] - z, 0, z - BOX[o + 3]);
    if (bx * bx + bz * bz >= best * best) continue; // whole chunk is farther
    const end = Math.min((c + 1) * CHUNK, SAMPLES);
    for (let i = c * CHUNK; i < end; i++) {
      const d = segDist(x, z, XS[i], ZS[i], XS[i + 1], ZS[i + 1]);
      if (d < best) best = d;
    }
  }
  return best;
}

function navigableWith(x: number, z: number, cd: number) {
  const water = Math.min(
    cd - HALF_WIDTH,
    rectSd(x, z, DARSENA),
    circleSd(x, z, GNL_BASIN),
    circleSd(x, z, ANCHORAGE),
  );
  return Math.max(water, -rectSd(x, z, JETTY));
}

function shallowWith(x: number, z: number, cd: number) {
  const t = Math.max(0, Math.min(1, (z - ESTUARY_START_Z) / (ESTUARY_FULL_Z - ESTUARY_START_Z)));
  const estuary = t === 0 ? Infinity : cd - ESTUARY_HALF_WIDTH * t;
  let canals = Infinity;
  for (const c of CANALS) {
    canals = Math.min(
      canals,
      segDist(x, z, c.x0, c.z0, c.x0 + c.ax * CANAL_LENGTH, c.z0 + c.az * CANAL_LENGTH) - CANAL_HALF_WIDTH,
    );
  }
  const delta = Math.max(rectSd(x, z, DELTA_NEAR), HALF_WIDTH + DELTA_LAND_STRIP - cd);
  return Math.min(estuary, canals, delta);
}

/**
 * Signed distance to navigable water: negative = water you can sail
 * (channel ∪ dársena ∪ GNL basin ∪ anchorage, minus the jetty), positive = not.
 */
export function navigableSd(x: number, z: number) {
  return navigableWith(x, z, centerlineDistance(x, z));
}

/** Signed distance to any visible water (navigable + shallows: estuary, canals, Delta). */
export function waterSd(x: number, z: number) {
  const cd = centerlineDistance(x, z);
  return Math.min(navigableWith(x, z, cd), shallowWith(x, z, cd));
}

/**
 * waterSd with the centerline distance already known — the terrain ribbon
 * builds each vertex at a known offset from the centerline, so it skips the
 * search (~110k vertices).
 */
export function waterSdKnown(x: number, z: number, cd: number) {
  return Math.min(navigableWith(x, z, cd), shallowWith(x, z, cd));
}

const LAND_CLEARANCE = 1;

/**
 * Point on the bank beside centerline point (x,z): pushed sideways from
 * `offset` outward until it's solid land, on whichever side gets there first
 * (west on ties). Used for the vuelta signs.
 */
export function bankPoint(_x: number, z: number, offset: number): [number, number] {
  for (let o = offset; o <= offset + 60; o += 1) {
    const w = besideRiver(z, o);
    if (waterSd(w[0], w[1]) >= LAND_CLEARANCE) return w;
    const e = besideRiver(z, -o);
    if (waterSd(e[0], e[1]) >= LAND_CLEARANCE) return e;
  }
  return besideRiver(z, offset);
}
