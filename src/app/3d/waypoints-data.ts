// Single source of truth for everything placed on the river. Pure data (no
// three.js) so the DOM HUD and the physics can import it without the 3D bundle.
//
// Object sizes at 1 u = 20 m; DISTANCES compressed ~12× (river-geometry.ts,
// scale.ts). Origin = B/T NANY berth (km 97). +Z downstream (south), +X east
// = Delta bank, −X west = mainland. Bank positions were computed against the
// river geometry so landmarks sit beside the 20 u river, not on it.

export type WaypointKind = "landmark" | "buoy" | "ship" | "mega" | "egg" | "vuelta" | "moored-ship" | "fsru";

/** IALA buoyage for the project buoys: special mark (yellow, X) or east cardinal. */
export type BuoyType = "special" | "cardinal-east";

export type Waypoint = {
  id: string;
  kind: WaypointKind;
  title: string;
  subtitle?: string; // small text under the label
  pos: [number, number, number]; // collision + distance center
  site?: [number, number, number]; // where the label is drawn, if not at pos
  labelY?: number; // label height (default per kind)
  rotation?: number; // yaw, radians (ships)
  color?: string; // three.js material color (hex — CSS tokens don't reach WebGL)
  pulse?: boolean;
  dim?: boolean; // WIP (relojes)
  struck?: boolean; // label crossed out
  collisionRadius: number; // 0 = doesn't block
  buoyType?: BuoyType;
  outsideChannel?: boolean; // moored off the dredged fairway
  size?: "medium" | "large"; // moored ships (large = 1.5×)
  clickable?: boolean;
  alTravesDetection?: boolean; // CTA when abeam (AlTravesDetector)
  projectId?: string; // id in src/lib/projects.ts
  media?: string; // id in project-media.ts → opens the al-través carousel
  proximityDetection?: boolean; // carousel when within PROXIMITY_DISTANCE (any angle)
  info?: [label: string, value: string][]; // technical modal (non-project waypoints)
};

const N = Math.PI / 2; // rotation for bow north (bow = local +X)

/** Window event a clickable 3D model fires to open its waypoint modal (detail = id). */
export const OPEN_WAYPOINT_EVENT = "open-waypoint";

/** Al-través carousel opened: physics clamps to `toKn` for `holdMs` (detail). */
export const AUTO_SLOW_EVENT = "autoslow";
/** Carousel closed (SEGUIR / timeout): release the clamp. */
export const AUTO_SLOW_CANCEL_EVENT = "autoslow-cancel";

/** FSRU EXCELERATE EXPEDIENT: west half of the river at km 74.5, bow upstream. */
export const FSRU = { id: "fsru-expedient", pos: [8.2, 0, 151.65] as [number, number, number], yaw: 1.81 };

/** Puerto Escobar (river-frame z of the tug quay). */
export const ESCOBAR_Z = 175;

/** Svitzer tugs alongside the Escobar quay (river frame: along +downstream, west from centerline). */
export const TUGS = [
  { name: "SVITZER MORA", along: -2, west: 7.9, bowUpstream: true, world: [11.9, 174.6] as [number, number] },
  { name: "SVITZER DAMKA", along: 0, west: 7.9, bowUpstream: false, world: [12.3, 176.5] as [number, number] },
  { name: "SVITZER AWE", along: 2, west: 7.9, bowUpstream: true, world: [12.6, 178.5] as [number, number] },
];

/** Carousel trigger range for the Zona Común ships (proximity, any angle). */
export const PROXIMITY_DISTANCE = 8;

/** Entering the Zona Común shows the welcome card (once per visit). */
export const ZONA_COMUN_ENTRY_Z = 632; // at the end of Canal Brown

// ------------------------------------------------------ Terminal AXION ----
/** B/T NANY berth (km 97): alongside the Campana quay, bow north. */
export const BERTH: [number, number, number] = [-6, 0, -4];
/** DESAMARRAR slides the NANY sideways off the quay to this x, clear of the line. */
export const CAST_OFF_X = -1.2;

// ---------------------------------------------------------- Zona Común ----
/** North–south axis of the anchorage: the gas pipeline, between west and east zones. */
export const ZONA_AXIS_X = 168;

/**
 * Anchoring areas as on the SHN chart: 1 = large ships, 2 = small Argentine
 * craft. West and east of Canal Brown, which runs diagonally between them: each
 * one stays clear of the lane and its buoys.
 */
export const ZONA_POLYGONS = [
  { id: "ZW1", minX: 124, maxX: 149, minZ: 640, maxZ: 680 },
  { id: "ZE1", minX: 180, maxX: 210, minZ: 640, maxZ: 680 },
  { id: "ZW2", minX: 130, maxX: 155, minZ: 690, maxZ: 720 },
  { id: "ZE2", minX: 187, maxX: 217, minZ: 690, maxZ: 720 },
];

/** Decorative ships waiting at anchor (not interactive; they do block). Bow = local +X. */
export type AnchoredShip = { x: number; z: number; length: number; yaw: number; hull: string };
export const ANCHORED_SHIPS: AnchoredShip[] = [
  // large (ZW1 / ZE1)
  { x: 133, z: 645, length: 14, yaw: 0.08, hull: "#16294a" },
  { x: 133, z: 673, length: 12, yaw: -0.12, hull: "#e4e7ea" },
  { x: 192, z: 646, length: 13, yaw: 3.05, hull: "#16294a" },
  { x: 188, z: 677, length: 12, yaw: 0.15, hull: "#e4e7ea" },
  // small (ZW2 / ZE2)
  { x: 137, z: 694, length: 5, yaw: 0.5, hull: "#b3261e" },
  { x: 136, z: 714, length: 4.5, yaw: -0.35, hull: "#e0b020" },
  { x: 209, z: 713, length: 5, yaw: 0.2, hull: "#b3261e" },
];

/** Submarine gas pipeline across the anchorage, marked by yellow special buoys. */
export const GASODUCTO = {
  x: ZONA_AXIS_X,
  buoyZs: Array.from({ length: 10 }, (_, i) => 620 + i * 10),
  warnDistance: 10,
};

export const nearGasoducto = (x: number, z: number) =>
  GASODUCTO.buoyZs.some((bz) => Math.hypot(x - GASODUCTO.x, z - bz) < GASODUCTO.warnDistance);

export const WAYPOINTS: Waypoint[] = [
  // ------------------------------------------------ nautical landmarks ----
  { id: "amarre", kind: "landmark", title: "TERMINAL AXION · KM 97", subtitle: "Campana · CARGA IFO 380 ✓", pos: BERTH, site: [-12, 0, -4], labelY: 2.6, collisionRadius: 0 },
  { id: "puente-zarate", kind: "landmark", title: "PUENTE ZÁRATE–BRAZO LARGO", subtitle: "km 106", pos: [-25, 0, -104], labelY: 14, collisionRadius: 0 },
  { id: "puerto-escobar", kind: "landmark", title: "PUERTO ESCOBAR", subtitle: "km 73", pos: [4.3, 0, 178.1], labelY: 3.2, collisionRadius: 0 },
  { id: "pna-lima", kind: "landmark", title: "PREFECTURA · PNA LIMA", subtitle: "km 50", pos: [26.8, 0, 254.8], labelY: 5, collisionRadius: 0 },
  { id: "mitre-start", kind: "landmark", title: "KM 48 · CANAL EMILIO MITRE", subtitle: "bifurcación · canal boyado", pos: [44.4, 0, 277.1], labelY: 3, collisionRadius: 0 },
  { id: "aeroparque", kind: "landmark", title: "AEROPARQUE J. NEWBERY", subtitle: "km 20", pos: [37.8, 0, 412.4], labelY: 8, collisionRadius: 0 },
  { id: "zona-comun", kind: "landmark", title: "ZONA COMÚN", subtitle: "km 2 · fondeadero", pos: [163, 0, 680], labelY: 4, collisionRadius: 0 },

  // FSRU — clickable technical modal (also opens when abeam)
  {
    id: FSRU.id,
    kind: "fsru",
    title: "FSRU EXCELERATE EXPEDIENT",
    subtitle: "GNL Escobar · km 74.5",
    pos: FSRU.pos,
    labelY: 5.5,
    collisionRadius: 0, // hull blocks via EXTRA_OBSTACLES (elongated)
    clickable: true,
    alTravesDetection: true,
    info: [
      ["IMO", "9389643"],
      ["Tipo", "FSRU · Floating Storage and Regasification Unit"],
      ["Eslora × manga", "280 m × 44 m"],
      ["Calado", "11 m"],
      ["Capacidad", "150.900 m³ GNL"],
      ["Operador", "Excelerate Energy"],
      ["Ubicación", "Muelle GNL Escobar · amarre permanente"],
    ],
  },

  // ------------------------------------------------------------ vueltas ----
  // Apexes of the bends (the banner ranges are in PLACES).
  { id: "vuelta-este", kind: "vuelta", title: "VUELTA DEL ESTE", subtitle: "km 101 · aguas arriba", pos: [24, 0, -52], collisionRadius: 0 },
  { id: "vuelta-campana", kind: "vuelta", title: "VUELTA CAMPANA", subtitle: "km 95", pos: [-12, 0, 35], collisionRadius: 0 },
  { id: "vuelta-hinojo", kind: "vuelta", title: "VUELTA HINOJO", subtitle: "km 90 · velocidad mínima · no adelantar", pos: [15, 0, 69], collisionRadius: 0 },
  // Provisional: informal pilots' name, not in the ordinance — confirm with Milton.
  { id: "vuelta-tordillo", kind: "vuelta", title: "VUELTA TORDILLO", subtitle: "km 80 · provisorio", pos: [-2, 0, 101], collisionRadius: 0 },

  // ----------------------------------------------------- project buoys ----
  // Outside the buoyed lane: Finanzas on the green (west) side, Relojes east.
  { id: "finanzas", kind: "buoy", buoyType: "special", title: "Finanzas Personales", subtitle: "Boya especial amarilla · km 38 Canal Mitre", pos: [64, 0, 335], outsideChannel: true, color: "#F7D417", pulse: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "finanzas", media: "mi-plata" },
  { id: "relojes", kind: "buoy", buoyType: "cardinal-east", title: "E-commerce Relojes", subtitle: "Boya cardinal · km 12 · fin del Canal Mitre", pos: [115.7, 0, 453.1], color: "#000000", pulse: true, dim: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "relojes", media: "relojes" },

  // ------------------------------------------- moored in line at Campana ----
  // One file along the quay, north to south, all bow north and port side to,
  // with the B/T NANY (BERTH) second. Hulls block via EXTRA_OBSTACLES.
  { id: "stena-image", kind: "moored-ship", title: "STENA IMAGE", subtitle: "Hellerup · bulk carrier", pos: [-6, 0, -10], rotation: N, size: "large", collisionRadius: 0 },
  { id: "khan", kind: "moored-ship", title: "KHAN LW2501", subtitle: "tanker fluvial", pos: [-6, 0, 2], rotation: N, size: "medium", collisionRadius: 0 },
  { id: "deltamar", kind: "moored-ship", title: "DELTAMAR IV", subtitle: "tanker fluvial", pos: [-6, 0, 8], rotation: N, size: "medium", collisionRadius: 0 },
  { id: "caleta-rosario", kind: "moored-ship", title: "CALETA ROSARIO", subtitle: "tanker", pos: [-6, 0, 14], rotation: N, size: "medium", collisionRadius: 0 },

  // ----------------------------------------------- Zona Común (km ~2) ----
  // Large ships in ZW1/ZE1, small ones in ZW2/ZE2. Each client opens its
  // project carousel when you come close (or click it). Hull colors per ship.
  { id: "evolvere", kind: "mega", title: "EVOLVERE", pos: [195, 0, 660], rotation: -0.15, color: "#25DB79", collisionRadius: 7, clickable: true, proximityDetection: true, media: "evolvere" },
  { id: "ospatrones", kind: "ship", title: "OSPATRONES", pos: [140, 0, 655], rotation: -0.3, color: "#dfe9f2", collisionRadius: 3, clickable: true, proximityDetection: true, media: "ospatrones" },
  { id: "musacchio", kind: "ship", title: "MUSACCHIO", pos: [200, 0, 670], rotation: 0.1, color: "#1d2f4f", collisionRadius: 3, clickable: true, proximityDetection: true, media: "musacchio" },
  { id: "marpla", kind: "ship", title: "MARPLA", pos: [145, 0, 700], rotation: 0.5, color: "#f2b8c6", collisionRadius: 3, clickable: true, proximityDetection: true, media: "marpla" },
  // Easter eggs: decoration only
  { id: "straits-sky", kind: "egg", title: "STRAITS SKY", subtitle: "bunker supply · IMO 9426635", pos: [197, 0, 701], rotation: -0.1, color: "#888888", collisionRadius: 3 },
  { id: "alfa-c", kind: "egg", title: "ALFA C", subtitle: "bunker tanker 🇵🇦 · IMO 9711652", pos: [208, 0, 695], rotation: 0.3, color: "#888888", collisionRadius: 3 },
];

/**
 * Green lateral buoy at km 98 where the NANY turns around (the "caída"),
 * upstream of the no-turning zone (km 96–97.5), on the port margin (Campana,
 * west), ~350 m from the berth and clear of the moored line.
 */
export const TURN_BUOY: [number, number, number] = [-5, 0, -22];

/**
 * Long hull as a row of small circles along its axis, so ships can lie close
 * together without one big radius swallowing its neighbours.
 */
function hullCircles(x: number, z: number, length: number, yaw: number, r: number) {
  const half = length / 2 - r;
  const n = Math.max(2, Math.ceil((half * 2) / r) + 1);
  return Array.from({ length: n }, (_, i) => {
    const s = -half + (i / (n - 1)) * half * 2;
    return { pos: [x + Math.cos(yaw) * s, z - Math.sin(yaw) * s] as [number, number], r };
  });
}

/** Hull length (u) of the ships moored at Campana (the NANY is 4). */
export const MOORED_LENGTH = { medium: 5.1, large: 6 } as const;

/** A point in the FSRU's own frame (local +X = bow, −Z = jetty side) → world. */
function fsruPoint(x: number, z: number): [number, number] {
  const c = Math.cos(FSRU.yaw);
  const s = Math.sin(FSRU.yaw);
  return [FSRU.pos[0] + c * x + s * z, FSRU.pos[2] - s * x + c * z];
}

/** Hull obstacles not covered by a waypoint circle: FSRU, dolphins, tugs, long ships. */
export const EXTRA_OBSTACLES: { pos: [number, number]; r: number }[] = [
  ...[-6, -2, 2, 6].map((x) => ({ pos: fsruPoint(x, 0), r: 1.3 })),
  ...[-7.5, 7.5].flatMap((x) => [-1.9, 1.9].map((z) => ({ pos: fsruPoint(x, z), r: 0.45 }))),
  ...TUGS.map((t) => ({ pos: t.world, r: 0.8 })),
  ...WAYPOINTS.filter((w) => w.kind === "moored-ship").flatMap((w) =>
    hullCircles(w.pos[0], w.pos[2], MOORED_LENGTH[w.size ?? "medium"], w.rotation ?? 0, 0.7),
  ),
  ...ANCHORED_SHIPS.flatMap((s) => hullCircles(s.x, s.z, s.length, s.yaw, s.length > 8 ? 1.2 : 0.7)),
];

/** Collision radius of the B/T NANY (80 m hull = 4 u). */
export const BOAT_RADIUS = 2;

/** Range (to the waypoint's edge) at which the HUD highlights it. */
export const NEAR_DISTANCE = 10;

// ------------------------------------------------------ place banners ----
/** Places the top banner names when the boat comes within `r`. */
export const PLACES: { name: string; x: number; z: number; r: number }[] = [
  { name: "VUELTA DEL ESTE", x: 24, z: -52, r: 12 },
  { name: "VUELTA CAMPANA", x: -12, z: 35, r: 12 },
  { name: "VUELTA HINOJO", x: 15, z: 69, r: 12 },
  { name: "VUELTA TORDILLO", x: -2, z: 101, r: 12 },
  { name: "GNL EXPEDIENT", x: FSRU.pos[0] + 7, z: 150, r: 12 },
  { name: "PUERTO ESCOBAR", x: 20, z: 176, r: 10 },
  { name: "PNA LIMA", x: 40, z: 250, r: 10 },
  { name: "CANAL MITRE", x: 50, z: 277, r: 10 },
  { name: "CANAL BROWN", x: 114, z: 473, r: 8 },
  { name: "ZONA COMÚN", x: 170, z: 680, r: 12 },
  { name: "MALECONES LA PLATA", x: 191, z: 757, r: 12 },
  { name: "TEC PLATA", x: 197, z: 775, r: 7 },
];

/** Closest place whose range contains (x,z), or null. */
export function activePlace(x: number, z: number) {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const p of PLACES) {
    const d = Math.hypot(p.x - x, p.z - z);
    if (d < p.r && d < bestDist) {
      best = p.name;
      bestDist = d;
    }
  }
  return best;
}

/** km 12: the fork where the player leaves the Canal Mitre for Canal Brown. */
export const BROWN_FORK = { x: 110, z: 455, range: 15 };

/**
 * Nearest waypoint measured to its EDGE (center distance − collisionRadius),
 * so big blocking ones can still read "near" when you're alongside.
 */
export function nearestWaypoint(x: number, z: number) {
  let best = WAYPOINTS[0];
  let bestDist = Infinity;
  for (const w of WAYPOINTS) {
    const d = Math.max(0, Math.hypot(w.pos[0] - x, w.pos[2] - z) - w.collisionRadius);
    if (d < bestDist) {
      best = w;
      bestDist = d;
    }
  }
  return { waypoint: best, distance: bestDist };
}
