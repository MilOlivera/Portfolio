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
  alertRadius?: number; // vueltas: HUD warning range
  buoyType?: BuoyType;
  size?: "medium" | "large"; // moored ships (large = 1.5×)
  clickable?: boolean;
  alTravesDetection?: boolean; // CTA when abeam (AlTravesDetector)
  projectId?: string; // id in src/lib/projects.ts
  info?: [label: string, value: string][]; // technical modal (non-project waypoints)
};

const N = Math.PI / 2; // rotation for bow north (bow = local +X)

/** Window event a clickable 3D model fires to open its waypoint modal (detail = id). */
export const OPEN_WAYPOINT_EVENT = "open-waypoint";

/** FSRU EXCELERATE EXPEDIENT: west half of the river at km 74.5, bow upstream. */
export const FSRU = { id: "fsru-expedient", pos: [18.1, 0, 111] as [number, number, number], yaw: 1.72 };

/** Puerto Escobar (river-frame z of the tug quay). */
export const ESCOBAR_Z = 85;

/** Svitzer tugs alongside the Escobar quay (river frame: along +downstream, west from centerline). */
export const TUGS = [
  { name: "SVITZER MORA", along: -1.75, west: 8.6, bowUpstream: true, world: [12.3, 85] as [number, number] },
  { name: "SVITZER DAMKA", along: 0, west: 8.6, bowUpstream: false, world: [12.6, 86.7] as [number, number] },
  { name: "SVITZER AWE", along: 1.75, west: 8.6, bowUpstream: true, world: [13, 88.4] as [number, number] },
];

export const WAYPOINTS: Waypoint[] = [
  // ------------------------------------------------ nautical landmarks ----
  { id: "amarre", kind: "landmark", title: "TERMINAL AXION · KM 97", subtitle: "Campana · CARGA IFO 380 ✓", pos: [0, 0, 0], site: [-5, 0, -9], labelY: 2.2, collisionRadius: 0 },
  { id: "puente-zarate", kind: "landmark", title: "PUENTE ZÁRATE–BRAZO LARGO", subtitle: "km 106", pos: [15, 0, -60], labelY: 14, collisionRadius: 0 },
  { id: "puerto-escobar", kind: "landmark", title: "PUERTO ESCOBAR", subtitle: "km 77 · remolcadores Svitzer", pos: [5.4, 0, 88.2], labelY: 3.2, collisionRadius: 0 },
  { id: "transf-granos", kind: "landmark", title: "TRANSFERENCIA DE GRANOS", subtitle: "km 69", pos: [12.3, 0, 133.6], labelY: 6, collisionRadius: 0 },
  { id: "pna-lima", kind: "landmark", title: "PREFECTURA · PNA LIMA", subtitle: "km 50", pos: [21.4, 0, 173.4], labelY: 5, collisionRadius: 0 },
  { id: "mitre-start", kind: "landmark", title: "KM 48 · CANAL EMILIO MITRE", subtitle: "bifurcación · canal boyado", pos: [34.3, 0, 191.7], labelY: 3, collisionRadius: 0 },
  { id: "aeroparque", kind: "landmark", title: "AEROPARQUE J. NEWBERY", subtitle: "km 20", pos: [28, 0, 326], labelY: 8, collisionRadius: 0 },
  { id: "zona-comun", kind: "landmark", title: "ZONA COMÚN", subtitle: "km 2 · fondeadero", pos: [110, 0, 400], labelY: 4, collisionRadius: 0 },

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
  // Close together on the compressed river: small alert radii so they don't overlap.
  { id: "vuelta-este", kind: "vuelta", title: "VUELTA DEL ESTE", subtitle: "km 101 · aguas arriba", pos: [10, 0, -40], collisionRadius: 0, alertRadius: 8 },
  { id: "vuelta-campana", kind: "vuelta", title: "VUELTA DE CAMPANA", subtitle: "km 95", pos: [8, 0, 25], collisionRadius: 0, alertRadius: 6 },
  { id: "vuelta-hinojo", kind: "vuelta", title: "VUELTA DEL HINOJO", subtitle: "km 90 · velocidad mínima · no adelantar", pos: [12, 0, 35], collisionRadius: 0, alertRadius: 6 },
  // Provisional: informal pilots' name, not in the ordinance — confirm with Milton.
  { id: "vuelta-tordillo", kind: "vuelta", title: "VUELTA DEL TORDILLO", subtitle: "km 80 · provisorio", pos: [15, 0, 50], collisionRadius: 0, alertRadius: 7 },

  // ----------------------------------------------------- project buoys ----
  // East of the buoyed lane (outside the fairway, inside the open shallows).
  { id: "finanzas", kind: "buoy", buoyType: "special", title: "Finanzas Personales", subtitle: "Boya especial amarilla · km 38 Canal Mitre", pos: [65.7, 0, 248.1], color: "#F7D417", pulse: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "finanzas" },
  { id: "relojes", kind: "buoy", buoyType: "cardinal-east", title: "E-commerce Relojes", subtitle: "Boya cardinal · km 12 · fin del Canal Mitre", pos: [105.7, 0, 368.1], color: "#000000", pulse: true, dim: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "relojes" },

  // --------------------------------------- moored at Campana (dársena) ----
  // All to PORT of the NANY (west, beyond the berth jetty), bow north like her.
  { id: "khan", kind: "moored-ship", title: "KHAN LW2501", subtitle: "tanker fluvial", pos: [-5, 0, 5], rotation: N, size: "medium", collisionRadius: 3 },
  { id: "deltamar", kind: "moored-ship", title: "DELTAMAR IV", subtitle: "tanker fluvial", pos: [-9, 0, 5], rotation: N, size: "medium", collisionRadius: 3 },
  { id: "caleta-rosario", kind: "moored-ship", title: "CALETA ROSARIO", subtitle: "tanker", pos: [-13, 0, 5], rotation: N, size: "medium", collisionRadius: 3 },
  { id: "stena-image", kind: "moored-ship", title: "STENA IMAGE", subtitle: "Hellerup · bulk carrier", pos: [-17.5, 0, 5], rotation: N, size: "large", collisionRadius: 4.5 },

  // ----------------------------------------------- Zona Común (km ~2) ----
  { id: "ospatrones", kind: "ship", title: "OSPATRONES", pos: [104, 0, 404], rotation: -0.3, color: "#00FF88", collisionRadius: 3, clickable: true },
  { id: "marpla", kind: "ship", title: "MARPLA", pos: [126, 0, 400], rotation: 0.5, color: "#00FF88", collisionRadius: 3, clickable: true },
  { id: "musacchio", kind: "ship", title: "MUSACCHIO", pos: [108, 0, 428], rotation: 0.1, color: "#00FF88", collisionRadius: 3, clickable: true },
  { id: "evolvere", kind: "mega", title: "EVOLVERE", pos: [124, 0, 422], rotation: -0.15, color: "#25DB79", collisionRadius: 7, clickable: true },
  { id: "straits-sky", kind: "egg", title: "STRAITS SKY", subtitle: "bunker supply · IMO 9426635", pos: [138, 0, 410], rotation: -0.1, color: "#888888", collisionRadius: 3 },
  { id: "alfa-c", kind: "egg", title: "ALFA C", subtitle: "bunker tanker 🇵🇦 · IMO 9711652", pos: [96, 0, 420], rotation: 0.3, color: "#888888", collisionRadius: 3 },
];

/**
 * Green lateral buoy at km 98 where the NANY turns around (the "caída"),
 * upstream of the no-turning zone (km 96–97.5), on the port margin (Campana,
 * west), ~300 m from the berth.
 */
export const TURN_BUOY: [number, number, number] = [-5, 0, -15];

/** Hull obstacles with no waypoint of their own: FSRU hull, its dolphins, the tugs. */
export const EXTRA_OBSTACLES: { pos: [number, number]; r: number }[] = [
  { pos: [19, 117], r: 1.3 },
  { pos: [18.4, 113], r: 1.3 },
  { pos: [17.8, 109.1], r: 1.3 },
  { pos: [17.2, 105.1], r: 1.3 },
  { pos: [15.1, 103.9], r: 0.45 },
  { pos: [18.8, 103.3], r: 0.45 },
  { pos: [17.3, 118.7], r: 0.45 },
  { pos: [21.1, 118.2], r: 0.45 },
  ...TUGS.map((t) => ({ pos: t.world, r: 0.8 })),
];

/** Collision radius of the B/T NANY (80 m hull = 4 u). */
export const BOAT_RADIUS = 2;

/** Range (to the waypoint's edge) at which the HUD highlights it. */
export const NEAR_DISTANCE = 10;

export const VUELTAS = WAYPOINTS.filter((w) => w.kind === "vuelta");

/** Closest vuelta whose alert range contains (x,z), or null. */
export function activeVuelta(x: number, z: number) {
  let best: Waypoint | null = null;
  let bestDist = Infinity;
  for (const w of VUELTAS) {
    const d = Math.hypot(w.pos[0] - x, w.pos[2] - z);
    if (d < (w.alertRadius ?? 0) && d < bestDist) {
      best = w;
      bestDist = d;
    }
  }
  return best;
}

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
