import { CatmullRomCurve3, Vector3 } from "three";

// Geometric source of truth for the river. Real km labels (Ordenanza 4-18
// DPSN) with COMPRESSED distances (~12×, see scale.ts) so the voyage fits in
// a few minutes. Object sizes stay at 1 u = 20 m.
// Origin = B/T NANY berth, km 97. Axes: +Z downstream (south), -Z upstream,
// +X east = Delta bank, -X west = mainland (Campana, Escobar, BA).
//
// Two widths: the visible river (20 u = 400 m) and, inside it, the dredged
// FAIRWAY (7.5 u = 150 m) marked by buoys. Outside the fairway you can still
// sail, slowly ("bajo fondo"). Terrain (Shoreline.tsx) and collision
// (BoatControls.tsx) both read the signed-distance functions below.

export const RIVER_CENTERLINE = [
  new Vector3(-60, 0, -175), // upstream, past the fog (river doesn't end in view)
  // Upstream reach (not sailed: scenery). The Vuelta del Este is an S: past
  // the green buoy the river turns east, then back north-west to the bridge,
  // so holding the northbound course runs you into the bank.
  new Vector3(-25, 0, -104), // Zárate–Brazo Largo bridge
  new Vector3(-10, 0, -90),
  new Vector3(6, 0, -80),
  new Vector3(20, 0, -68), // reversal
  new Vector3(24, 0, -52), // km 101 · Vuelta del Este, apex (east)
  new Vector3(13, 0, -37),
  new Vector3(1, 0, -24), // green turning buoy
  new Vector3(0, 0, -12),
  new Vector3(0, 0, 0), // B/T NANY berth

  // Downstream (sailed). West = negative x (starboard sailing down).
  new Vector3(2, 0, 12), // clear of the quay
  // Vuelta Campana: bend to the WEST
  new Vector3(-5, 0, 23),
  new Vector3(-12, 0, 35), // apex
  new Vector3(-8, 0, 48),
  // Vuelta Hinojo: right after it, to the EAST
  new Vector3(3, 0, 57),
  new Vector3(15, 0, 69), // apex
  new Vector3(11, 0, 81),
  // Vuelta Tordillo: very gentle, to the WEST
  new Vector3(3, 0, 91),
  new Vector3(-2, 0, 101), // apex
  new Vector3(2, 0, 114),

  // Cancha larga
  new Vector3(9, 0, 130),
  new Vector3(15, 0, 150), // FSRU EXPEDIENT · GNL Escobar
  new Vector3(20, 0, 175), // Puerto Escobar
  new Vector3(25, 0, 200),
  new Vector3(32, 0, 225),

  // Into the Ingeniero Mitre (gentle bend)
  new Vector3(40, 0, 250), // PNA LIMA + Canal de la Honda
  new Vector3(50, 0, 275), // start of the Canal Mitre

  // Canal Mitre (straight SE, IALA-buoyed)
  new Vector3(60, 0, 305),
  new Vector3(70, 0, 335), // km 38 (Finanzas, outside the channel)
  new Vector3(80, 0, 365),
  new Vector3(90, 0, 395), // off Aeroparque
  new Vector3(100, 0, 425),
  new Vector3(110, 0, 455), // km 12: fork — Puerto BA to the west (not sailed)

  // Canal Brown (sailed), from the fork down to the Zona Común
  new Vector3(118, 0, 490), // Brown entrance
  new Vector3(128, 0, 530),
  new Vector3(138, 0, 570),
  new Vector3(148, 0, 610),
  new Vector3(158, 0, 650), // arriving at the Zona Común
  new Vector3(170, 0, 680), // middle of the Zona Común
  new Vector3(180, 0, 720), // leaving for the malecones
  new Vector3(190, 0, 760), // malecones, km 8.7
  new Vector3(200, 0, 790), // TEC PLATA
  new Vector3(212, 0, 850), // continues past the fog
];

export const RIVER_CURVE = new CatmullRomCurve3(RIVER_CENTERLINE, false, "catmullrom", 0.5);

/** Dredged fairway: 7.5 u = 150 m (the buoyed lane). */
export const RIVER_WIDTH = 7.5;
export const HALF_WIDTH = RIVER_WIDTH / 2;
/** Visible river: 20 u = 400 m. */
export const RIVER_WIDTH_VISUAL = 20;
export const VISUAL_HALF = RIVER_WIDTH_VISUAL / 2;

// ------------------------------------------------------------- samples ----
const SAMPLES = 900;
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

/** Centerline point, downstream tangent and west normal at a given world Z (Z grows monotonically). */
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

/** rotation.y that aligns a local +X axis with the downstream tangent at `z`. */
export function riverYaw(z: number) {
  const f = frameAtZ(z);
  return Math.atan2(-f.tz, f.tx);
}

// ---------------------------------------------------------- east bank ----
// Leaving Campana the Delta comes right down to the fairway: along this stretch
// the east bank has no shallows (eased in off the berth, out before Hinojo).
// The terrain meets the water ~0.2 u past `half`, so land starts at the edge of
// the dredged lane.
const EAST_NARROW = { easeIn: -10, fromZ: 0, toZ: 50, easeOut: 60, half: HALF_WIDTH - 0.2 };

function smoothstep(a: number, b: number, v: number) {
  const t = Math.max(0, Math.min(1, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Half-width of the visible river east of the centerline at `z`. */
export function eastHalfWidth(z: number) {
  const { easeIn, fromZ, toZ, easeOut, half } = EAST_NARROW;
  const k = smoothstep(easeIn, fromZ, z) - smoothstep(toZ, easeOut, z);
  return VISUAL_HALF - (VISUAL_HALF - half) * k;
}

function visualHalf(x: number, z: number) {
  const east = eastHalfWidth(z);
  return east < VISUAL_HALF && x > frameAtZ(z).x ? east : VISUAL_HALF;
}

// --------------------------------------------------------------- zones ----
type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

// Campana port basin (dársena): the moored line and the water behind the quay.
const DARSENA: Rect = { minX: -19, maxX: -2, minZ: -14, maxZ: 19 };
/** Terminal AXION quay (30 u): every ship lies port side to its east face. */
export const JETTY: Rect = { minX: -9.3, maxX: -6.7, minZ: -12, maxZ: 18 };
/** Causeway joining the quay's north end to the west bank. */
export const CAUSEWAY: Rect = { minX: -19.5, maxX: -9.3, minZ: -12, maxZ: -10 };
// Zona Común anchorage: open water around the four anchoring areas.
const ANCHORAGE: Rect = { minX: 116, maxX: 224, minZ: 632, maxZ: 728 };

// Río de la Plata around the Canal Mitre: wide open shallows (visible, not
// navigable). Widens from the Mitre start.
const ESTUARY_START_Z = 263;
const ESTUARY_FULL_Z = 285;
const ESTUARY_HALF_WIDTH = 40;

// East of the Canal Mitre there is no coast at all: it's the open river. The
// Delta shore falls away between these two z, and from FULL on (Mitre, Canal
// Brown, Zona Común) it's water to the horizon.
const OPEN_EAST_START_Z = 270;
export const OPEN_EAST_FULL_Z = 300;
const OPEN_EAST_REACH = 200; // how far the shore has receded just before FULL

/** True where (x,z) is in the open water east of the route (no terrain at all). */
export function inOpenEast(x: number, z: number) {
  return z >= OPEN_EAST_FULL_Z && x > frameAtZ(z).x;
}

function openEastSd(x: number, z: number, cd: number) {
  if (z <= OPEN_EAST_START_Z || x <= frameAtZ(z).x) return Infinity;
  if (z >= OPEN_EAST_FULL_Z) return -OPEN_EAST_REACH;
  const t = (z - OPEN_EAST_START_Z) / (OPEN_EAST_FULL_Z - OPEN_EAST_START_Z);
  return cd - (ESTUARY_HALF_WIDTH + OPEN_EAST_REACH * t * t);
}

// Delta side canals (visible water, not navigable): perpendicular to the river
// toward the east, starting on the centerline.
const CANAL_LENGTH = 60;
const CANAL_HALF_WIDTH = 3;
export const CANALS = [
  { id: "gob-arias", name: "Canal Gob. Arias", z: 90 },
  { id: "gob-laserna", name: "Canal Gob. La Serna", z: 219 },
  { id: "canal-honda", name: "Canal de la Honda", z: 254 },
].map((c) => {
  const f = frameAtZ(c.z);
  return { ...c, x0: f.x, z0: f.z, ax: -f.wx, az: -f.wz, length: CANAL_LENGTH, halfWidth: CANAL_HALF_WIDTH };
});

// Delta islands east of the upstream reach: side channels behind a land strip.
const DELTA_NEAR: Rect = { minX: 18, maxX: 75, minZ: -65, maxZ: -14 };
const DELTA_LAND_STRIP = 4;

// Puerto Buenos Aires access channels: they leave the Canal Mitre to the west
// at km 12. Scenery (PuertoBA.tsx): the dredged fairway follows Canal Brown.
export const BA_CHANNELS: { name: string; path: [number, number][] }[] = [
  { name: "CANAL NORTE", path: [[102, 444.8], [88, 447], [66, 450]] },
  { name: "CANAL SUR", path: [[104.5, 452.5], [82, 455], [68, 464]] },
];
const BA_HALF_WIDTH = 3;

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
  const water = Math.min(cd - visualHalf(x, z), rectSd(x, z, DARSENA), rectSd(x, z, ANCHORAGE));
  return Math.max(water, -rectSd(x, z, JETTY), -rectSd(x, z, CAUSEWAY));
}

function shallowWith(x: number, z: number, cd: number) {
  const t = Math.max(0, Math.min(1, (z - ESTUARY_START_Z) / (ESTUARY_FULL_Z - ESTUARY_START_Z)));
  const estuary = t === 0 ? Infinity : cd - (VISUAL_HALF + (ESTUARY_HALF_WIDTH - VISUAL_HALF) * t);
  let canals = Infinity;
  for (const c of CANALS) {
    canals = Math.min(
      canals,
      segDist(x, z, c.x0, c.z0, c.x0 + c.ax * c.length, c.z0 + c.az * c.length) - c.halfWidth,
    );
  }
  const delta = Math.max(rectSd(x, z, DELTA_NEAR), VISUAL_HALF + DELTA_LAND_STRIP - cd);
  return Math.min(estuary, canals, delta, openEastSd(x, z, cd));
}

/**
 * Signed distance to navigable water: negative = water you can sail (visible
 * river ∪ dársena ∪ anchorage, minus the berth jetty/causeway), positive = not.
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
 * True when (x,z) is outside the dredged fairway in the open river — not in
 * the Campana port area (berth/turning, z < 19) nor the Zona Común anchorage,
 * where there's no fairway to keep to.
 */
export function outsideFairway(x: number, z: number) {
  if (z < 19 || rectSd(x, z, ANCHORAGE) < 0) return false;
  return centerlineDistance(x, z) > HALF_WIDTH;
}

/** True in the mouth of a Puerto BA channel: off the fairway, headed the wrong way. */
export function inBaBranch(x: number, z: number) {
  const near = BA_CHANNELS.some(({ path }) =>
    path.slice(1).some(([bx, bz], i) => segDist(x, z, path[i][0], path[i][1], bx, bz) < BA_HALF_WIDTH),
  );
  return near && centerlineDistance(x, z) > HALF_WIDTH;
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
