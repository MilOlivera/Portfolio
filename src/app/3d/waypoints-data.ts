// Single source of truth for everything placed on the river. Pure data (no
// three.js) so the DOM HUD and the physics can import it without the 3D bundle.
//
// Scale 1 u = 20 m, origin = B/T NANY berth (km 97). +Z downstream (south),
// +X east = Delta bank, −X west = mainland. Official km posts (Ordenanza 4-18
// DPSN); positions on the banks were computed against river-geometry.ts so
// landmarks sit beside the channel, not on it.

export type WaypointKind = "landmark" | "buoy" | "ship" | "mega" | "egg" | "vuelta" | "moored-ship";

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
  alTravesDetection?: boolean; // CTA when the buoy is abeam (AlTravesDetector)
  projectId?: string; // id in src/lib/projects.ts
};

const N = Math.PI / 2; // rotation for bow north (bow = local +X)

export const WAYPOINTS: Waypoint[] = [
  // ------------------------------------------------ nautical landmarks ----
  { id: "amarre", kind: "landmark", title: "TERMINAL AXION · KM 97", subtitle: "Campana · CARGA IFO 380 ✓", pos: [0, 0, 0], site: [-2, 0, -10], labelY: 2.2, collisionRadius: 0 },
  { id: "puente-zarate", kind: "landmark", title: "PUENTE ZÁRATE–BRAZO LARGO", subtitle: "km 106", pos: [45, 0, -450], labelY: 46, collisionRadius: 0 },
  { id: "gnl-escobar", kind: "landmark", title: "MUELLE GNL ESCOBAR", subtitle: "km 74.5 · zona de giro gaseros", pos: [31, 0, 1100], labelY: 4, collisionRadius: 0 },
  { id: "transf-granos", kind: "landmark", title: "TRANSFERENCIA DE GRANOS", subtitle: "km 69", pos: [115.4, 0, 1501.6], labelY: 6, collisionRadius: 0 },
  { id: "pna-lima", kind: "landmark", title: "PREFECTURA · PNA LIMA", subtitle: "km 50", pos: [211, 0, 2151], labelY: 5, collisionRadius: 0 },
  { id: "mitre-start", kind: "landmark", title: "KM 48 · CANAL EMILIO MITRE", subtitle: "bifurcación · canal boyado", pos: [238.3, 0, 2400.9], labelY: 3, collisionRadius: 0 },
  { id: "aeroparque", kind: "landmark", title: "AEROPARQUE J. NEWBERY", subtitle: "km 20", pos: [424.5, 0, 4135.8], labelY: 8, collisionRadius: 0 },
  { id: "zona-comun", kind: "landmark", title: "ZONA COMÚN", subtitle: "km 2 · fondeadero", pos: [680, 0, 5000], labelY: 4, collisionRadius: 0 },

  // ------------------------------------------------------------ vueltas ----
  // Vuelta del Este is upstream of the berth (not sailed): tiny alert radius.
  { id: "vuelta-este", kind: "vuelta", title: "VUELTA DEL ESTE", subtitle: "km 100 · aguas arriba", pos: [25, 0, -175], collisionRadius: 0, alertRadius: 15 },
  { id: "vuelta-campana", kind: "vuelta", title: "VUELTA DE CAMPANA", subtitle: "km 95", pos: [8, 0, 110], collisionRadius: 0, alertRadius: 25 },
  { id: "vuelta-hinojo", kind: "vuelta", title: "VUELTA DEL HINOJO", subtitle: "km 90 · velocidad mínima · no adelantar", pos: [23, 0, 380], collisionRadius: 0, alertRadius: 25 },
  // Provisional: informal pilots' name, not in the ordinance — confirm with Milton.
  { id: "vuelta-tordillo", kind: "vuelta", title: "VUELTA DEL TORDILLO", subtitle: "km 80 · provisorio", pos: [45, 0, 800], collisionRadius: 0, alertRadius: 25 },

  // ----------------------------------------------------- project buoys ----
  // Outside the buoyed lane (east side of the Mitre, open shallows), abeam CTA.
  { id: "finanzas", kind: "buoy", buoyType: "special", title: "Finanzas Personales", subtitle: "Boya especial amarilla · km 38 Canal Mitre", pos: [381.1, 0, 3190.9], color: "#F7D417", pulse: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "finanzas" },
  { id: "relojes", kind: "buoy", buoyType: "cardinal-east", title: "E-commerce Relojes", subtitle: "Boya cardinal · km 12 · fin del Canal Mitre", pos: [605.6, 0, 4597.5], color: "#000000", pulse: true, dim: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "relojes" },

  // --------------------------------------- moored at Campana (dársena) ----
  // All to PORT of the NANY (west, beyond the jetty), bow north like her.
  { id: "khan", kind: "moored-ship", title: "KHAN LW2501", subtitle: "tanker fluvial", pos: [-5, 0, 5], rotation: N, size: "medium", collisionRadius: 3 },
  { id: "deltamar", kind: "moored-ship", title: "DELTAMAR IV", subtitle: "tanker fluvial", pos: [-9, 0, 5], rotation: N, size: "medium", collisionRadius: 3 },
  { id: "caleta-rosario", kind: "moored-ship", title: "CALETA ROSARIO", subtitle: "tanker", pos: [-13, 0, 5], rotation: N, size: "medium", collisionRadius: 3 },
  { id: "stena-image", kind: "moored-ship", title: "STENA IMAGE", subtitle: "Hellerup · bulk carrier", pos: [-17.5, 0, 5], rotation: N, size: "large", collisionRadius: 4.5 },

  // ------------------------------------------------ Zona Común (km ~2) ----
  { id: "ospatrones", kind: "ship", title: "OSPATRONES", pos: [665, 0, 5040], rotation: -0.3, color: "#00FF88", collisionRadius: 4, clickable: true },
  { id: "marpla", kind: "ship", title: "MARPLA", pos: [686, 0, 5034], rotation: 0.5, color: "#00FF88", collisionRadius: 4, clickable: true },
  { id: "musacchio", kind: "ship", title: "MUSACCHIO", pos: [672, 0, 5064], rotation: 0.1, color: "#00FF88", collisionRadius: 4, clickable: true },
  { id: "evolvere", kind: "mega", title: "EVOLVERE", pos: [700, 0, 5080], rotation: -0.15, color: "#25DB79", collisionRadius: 9, clickable: true },
  { id: "straits-sky", kind: "egg", title: "STRAITS SKY", subtitle: "bunker supply · IMO 9426635", pos: [718, 0, 5050], rotation: -0.1, color: "#888888", collisionRadius: 4 },
  { id: "alfa-c", kind: "egg", title: "ALFA C", subtitle: "bunker tanker 🇵🇦 · IMO 9711652", pos: [648, 0, 5062], rotation: 0.3, color: "#888888", collisionRadius: 4 },
];

/**
 * Green lateral buoy at km 98 where the NANY turns around (the "caída"),
 * upstream of the no-turning zone (km 96–97.5). On the Delta-side (east)
 * edge of the channel: starboard when heading upstream.
 */
export const TURN_BUOY: [number, number, number] = [13.3, 0, -39.5];

/** Hull obstacles with no waypoint of their own (GNL Escobar LNG carrier). */
export const EXTRA_OBSTACLES: { pos: [number, number]; r: number }[] = [
  { pos: [37, 1092], r: 2 },
  { pos: [37, 1100], r: 2 },
  { pos: [37, 1108], r: 2 },
];

/** Collision radius of the B/T NANY (80 m hull = 4 u). */
export const BOAT_RADIUS = 2;

/** Range (to the waypoint's edge) at which the HUD highlights it. */
export const NEAR_DISTANCE = 15;

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
