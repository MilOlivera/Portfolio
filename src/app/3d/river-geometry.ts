import { CatmullRomCurve3, Vector3 } from "three";

// Geometric source of truth for the river (1 km = 2 units, -Z = north,
// +X = east). Terrain (Shoreline.tsx) and collision (BoatControls.tsx) both
// read the signed-distance functions below: what you see is what blocks you.
//
// Campana layout (the B/T NANY moored at (0,-2), bow north / upstream):
//   PORT (west, x < -4)  → industrial bank + the moored-ships row
//   STARBOARD (east)     → Delta del Paraná islands, nothing industrial
//   AHEAD (north)        → the main river curving NE (Vuelta de Campana,
//                          not taken) up to the Zárate–Brazo Largo bridge
//   ASTERN (south)       → downstream, the route

export const RIVER_CENTERLINE = [
  // Upstream reach (scenery: the world bound stops you before the bridge)
  new Vector3(32, 0, -120), // continues past the bridge into the fog
  new Vector3(30, 0, -80), // Zárate–Brazo Largo bridge area
  new Vector3(25, 0, -55),
  new Vector3(15, 0, -30), // Vuelta de Campana (not taken)
  new Vector3(5, 0, -12),
  // Port basin
  new Vector3(0, 0, -2), // Terminal AXION (our berth)
  new Vector3(4, 0, 6), // basin exit
  // Downstream (the route)
  new Vector3(10, 0, 18),
  new Vector3(16, 0, 28),
  new Vector3(22, 0, 38), // Escobar
  new Vector3(26, 0, 48), // into the Hinojo
  new Vector3(32, 0, 52), // Vuelta del Hinojo
  new Vector3(40, 0, 54),
  new Vector3(45, 0, 58), // Vuelta del Tordillo
  new Vector3(52, 0, 59),
  new Vector3(60, 0, 60), // end of the Paraná, fork toward the Mitre
  // Canal Emilio Mitre (straight)
  new Vector3(70, 0, 70),
  new Vector3(85, 0, 89), // Km 12
  // Canal Brown
  new Vector3(130, 0, 105),
  new Vector3(170, 0, 120),
  new Vector3(203, 0, 133), // Zona Común
];

export const RIVER_CURVE = new CatmullRomCurve3(RIVER_CENTERLINE, false, "catmullrom", 0.5);

/** Navigable channel width (units). */
export const RIVER_WIDTH = 16;
const HALF_WIDTH = RIVER_WIDTH / 2;

// ------------------------------------------------------------- samples ----
// Arc-length samples as flat arrays, plus per-chunk bounding boxes so distance
// queries skip far-away stretches (terrain build: ~50k queries).
const SAMPLES = 300;
const pts = RIVER_CURVE.getSpacedPoints(SAMPLES);
const XS = Float64Array.from(pts, (p) => p.x);
const ZS = Float64Array.from(pts, (p) => p.z);

const CHUNK = 10; // segments per chunk
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

// --------------------------------------------------------------- zones ----
type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

// Turning basin at the berth: the boat's turning radius (~10 u) is wider than
// half the channel. Verified by simulation: undock → caída a estribor (W + D)
// → the whole route clears every bank.
const BASIN = { x: 8, z: 4, r: 18 };
// Zona Común anchorage (open water around the destination ships).
const ANCHORAGE = { x: 205, z: 135, r: 26 };
// Port side: everything west of x=-4 is the industrial bank…
const PORT_LAND: Rect = { minX: -1e4, maxX: -4, minZ: -1e4, maxZ: 1e4 };
// …except the row where KHAN / DELTAMAR / CALETA / STENA lie moored.
const MOORING_ROW: Rect = { minX: -60, maxX: -4, minZ: -11, maxZ: 7 };
// Delta del Paraná: visible side channels behind a land strip, not navigable
// (islands live here — DeltaIslands.tsx). South of the route and starboard
// (east) of the berth.
const DELTA_SOUTH: Rect = { minX: 2, maxX: 50, minZ: 62, maxZ: 108 };
const DELTA_EAST: Rect = { minX: 32, maxX: 85, minZ: -60, maxZ: 10 };
const DELTA_LAND_STRIP = 5; // land kept between navigable water and the delta

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

const basinSd = (x: number, z: number) => Math.hypot(x - BASIN.x, z - BASIN.z) - BASIN.r;

/**
 * Signed distance to navigable water: negative = water you can sail
 * (channel ∪ basin ∪ anchorage, minus the port bank, plus the mooring row),
 * positive = land.
 */
export function navigableSd(x: number, z: number) {
  const channel = centerlineDistance(x, z) - HALF_WIDTH;
  const anchorage = Math.hypot(x - ANCHORAGE.x, z - ANCHORAGE.z) - ANCHORAGE.r;
  const water = Math.max(Math.min(channel, basinSd(x, z), anchorage), -rectSd(x, z, PORT_LAND));
  return Math.min(water, rectSd(x, z, MOORING_ROW));
}

/** Signed distance to any visible water (navigable + Delta side channels). */
export function waterSd(x: number, z: number) {
  const zones = Math.min(rectSd(x, z, DELTA_SOUTH), rectSd(x, z, DELTA_EAST));
  const strip = Math.max(
    HALF_WIDTH + DELTA_LAND_STRIP - centerlineDistance(x, z),
    DELTA_LAND_STRIP - basinSd(x, z),
  );
  return Math.min(navigableSd(x, z), Math.max(zones, strip));
}

const LAND_CLEARANCE = 1.5;

/**
 * Point on the bank beside (x,z): the foot on the centerline pushed sideways
 * by `offset` (or further, until it's solid land), on whichever side is land.
 * Used for the vuelta signs.
 */
export function bankPoint(x: number, z: number, offset: number): [number, number] {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < SAMPLES; i++) {
    const d = segDist(x, z, XS[i], ZS[i], XS[i + 1], ZS[i + 1]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  const tx = XS[best + 1] - XS[best];
  const tz = ZS[best + 1] - ZS[best];
  const len = Math.hypot(tx, tz) || 1;
  const nx = -tz / len;
  const nz = tx / len;
  let pick: [number, number] = [x + nx * offset, z + nz * offset];
  for (let o = offset; o <= offset + 24; o += 1) {
    const a: [number, number] = [x + nx * o, z + nz * o];
    const b: [number, number] = [x - nx * o, z - nz * o];
    const sa = waterSd(a[0], a[1]);
    const sb = waterSd(b[0], b[1]);
    pick = sa >= sb ? a : b;
    if (Math.max(sa, sb) >= LAND_CLEARANCE) break;
  }
  return pick;
}
