// Single source of truth for everything placed on the river. Pure data (no
// three.js) so the DOM HUD and the physics can import it without the 3D bundle.
//
// REAL-WORLD SCALE: 1 km = 2 units. Origin = Terminal AXION (Campana).
// Axes: -Z = north, +Z = south (downstream), +X = east.
// Everything is placed against the river in river-geometry.ts: blocking
// landmarks sit on the bank so their collision circle only touches the
// channel edge, buoys sit on the centerline.

export type WaypointKind = "landmark" | "buoy" | "ship" | "mega" | "egg" | "vuelta" | "moored-ship";

/** IALA buoyage: special mark (yellow, X topmark) or east cardinal. */
export type BuoyType = "special" | "cardinal-east";

export type Waypoint = {
  id: string;
  kind: WaypointKind;
  title: string;
  subtitle?: string; // small text under the label
  pos: [number, number, number]; // collision + distance center
  /**
   * Where a landmark's label is drawn when it isn't `pos` — e.g. AXION and
   * TENARIS, whose pos is the berth the boat starts in; their structures are
   * the Campana buildings on the quay (Shoreline.tsx), so no block is drawn.
   */
  site?: [number, number, number];
  rotation?: number; // yaw, radians (ships only)
  color?: string; // three.js material color (hex — CSS tokens don't reach WebGL)
  pulse?: boolean;
  dim?: boolean; // WIP (e.g. relojes)
  struck?: boolean; // label crossed out ("not the destination")
  collisionRadius: number; // 0 = doesn't block (light buoys)
  alertRadius?: number; // vueltas: HUD warning range
  buoyType?: BuoyType; // buoys
  size?: "medium" | "large"; // moored ships (large = 1.5×)
  clickable?: boolean; // opens a project CTA
  alTravesDetection?: boolean; // CTA appears when the buoy is abeam (AlTravesDetector)
  projectId?: string; // id in src/lib/projects.ts shown by the CTA/modal
};

export const WAYPOINTS: Waypoint[] = [
  // GEOGRAPHIC LANDMARKS
  // AXION / TENARIS are the berth the boat starts in: no collision circle
  // (it would trap the boat); their buildings block via the quay.
  { id: "axion", kind: "landmark", title: "TERMINAL AXION", subtitle: "Km 96.5 · CARGA IFO 380 ✓", pos: [0, 0, 0], site: [-16, 0, 12], collisionRadius: 0 },
  { id: "tenaris", kind: "landmark", title: "TENARIS SIDERCA", subtitle: "Km 98.5", pos: [-3, 0, -1], site: [-26, 0, -19], collisionRadius: 0 },
  // Escobar / Km 12 / Puerto BA on the SW (mainland) bank — on the centerline
  // their radii (8–20) would close the 16-wide channel.
  { id: "escobar", kind: "landmark", title: "PUERTO ESCOBAR", subtitle: "Km ~70", pos: [6.8, 0, 45.6], collisionRadius: 8 },
  { id: "km12-ba", kind: "landmark", title: "Km 12 — Puerto BA", subtitle: "NO ES EL DESTINO", pos: [71.6, 0, 112.4], collisionRadius: 18, color: "#aa2222", struck: true },
  { id: "puerto-ba", kind: "landmark", title: "PUERTO BUENOS AIRES", subtitle: "landmark referencial", pos: [95.1, 0, 127.6], collisionRadius: 20 },
  // Recalada beside the Canal Brown (12 u off-center): at (180,130) it blocked the channel
  { id: "recalada", kind: "landmark", title: "RECALADA", subtitle: "pilot station", pos: [177.7, 0, 135.9], collisionRadius: 4 },
  { id: "puerto-lp", kind: "landmark", title: "PUERTO LA PLATA", subtitle: "10.36m · canal 2.5nm", pos: [194, 0, 160], collisionRadius: 15 },

  // THE THREE VUELTAS (on the centerline; sign on the bank, HUD alert in range).
  // Campana's is upstream (north) of the berth — not on the route; its small
  // alert radius keeps it quiet during the caída.
  { id: "vuelta-campana", kind: "vuelta", title: "VUELTA DE CAMPANA", subtitle: "Km 95 · aguas arriba del amarre", pos: [15, 0, -30], collisionRadius: 0, alertRadius: 12 },
  { id: "vuelta-hinojo", kind: "vuelta", title: "VUELTA DEL HINOJO", subtitle: "Km ~75 · velocidad mínima · no adelantar", pos: [32, 0, 52], collisionRadius: 0, alertRadius: 25 },
  { id: "vuelta-tordillo", kind: "vuelta", title: "VUELTA DEL TORDILLO", subtitle: "Km ~70 · velocidad mínima · no adelantar", pos: [45, 0, 58], collisionRadius: 0, alertRadius: 25 },

  // PUBLIC-PROJECT BUOYS — only in the Canal Mitre (dredged, buoyed channel).
  // The Paraná de las Palmas has none: you follow the natural course.
  { id: "finanzas", kind: "buoy", buoyType: "special", title: "Finanzas Personales", subtitle: "Boya especial amarilla · Km 38 Canal Mitre", pos: [73, 0, 63], color: "#F7D417", pulse: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "finanzas" },
  { id: "relojes", kind: "buoy", buoyType: "cardinal-east", title: "E-commerce Relojes", subtitle: "Boya cardinal · Km 12 Canal Mitre (bifurcación)", pos: [85, 0, 89], color: "#000000", pulse: true, dim: true, collisionRadius: 0, clickable: true, alTravesDetection: true, projectId: "relojes" },

  // MOORED AT CAMPANA — all to PORT (west, the industrial bank), bow north
  // like the B/T NANY, in one row (river-geometry.ts → MOORING_ROW).
  // STENA / CALETA moved here from starboard: there they sat on the caída's
  // turning circle (would trap the boat) and starboard is Delta, not port.
  { id: "khan", kind: "moored-ship", title: "KHAN LW2501", subtitle: "tanker fluvial", pos: [-12, 0, -3], rotation: Math.PI / 2, size: "medium", collisionRadius: 5 },
  { id: "deltamar", kind: "moored-ship", title: "DELTAMAR IV", subtitle: "tanker fluvial", pos: [-25, 0, -3], rotation: Math.PI / 2, size: "medium", collisionRadius: 5 },
  { id: "stena-image", kind: "moored-ship", title: "STENA IMAGE", subtitle: "Hellerup · bulk carrier", pos: [-52, 0, -1], rotation: Math.PI / 2, size: "large", collisionRadius: 8 },
  { id: "caleta-rosario", kind: "moored-ship", title: "CALETA ROSARIO", subtitle: "tanker", pos: [-38, 0, -3], rotation: Math.PI / 2, size: "medium", collisionRadius: 5 },

  // CLIENT SHIPS — Zona Común (centered on 203, 133)
  { id: "ospatrones", kind: "ship", title: "OSPATRONES", pos: [198, 0, 128], rotation: -0.3, color: "#00FF88", collisionRadius: 6, clickable: true },
  { id: "marpla", kind: "ship", title: "MARPLA", pos: [207, 0, 130], rotation: 0.5, color: "#00FF88", collisionRadius: 6, clickable: true },
  { id: "musacchio", kind: "ship", title: "MUSACCHIO", pos: [202, 0, 140], rotation: 0.1, color: "#00FF88", collisionRadius: 6, clickable: true },

  // MEGA SHIP
  { id: "evolvere", kind: "mega", title: "EVOLVERE", pos: [215, 0, 135], rotation: -0.15, color: "#25DB79", collisionRadius: 15, clickable: true },

  // EASTER EGGS (real bunker vessels)
  { id: "straits-sky", kind: "egg", title: "STRAITS SKY", subtitle: "bunker supply · IMO 9426635", pos: [210, 0, 142], rotation: -0.1, color: "#888888", collisionRadius: 5 },
  { id: "alfa-c", kind: "egg", title: "ALFA C", subtitle: "bunker tanker 🇵🇦 · IMO 9711652", pos: [196, 0, 136], rotation: 0.3, color: "#888888", collisionRadius: 5 },
];

/** Approximate radius of the B/T NANY (hull 8 long) for collisions. */
export const BOAT_RADIUS = 4;

/** Range (to the waypoint's edge) at which the HUD highlights it. */
export const NEAR_DISTANCE = 15;

/**
 * Nearest waypoint measured to its EDGE (center distance − collisionRadius),
 * so big blocking ones (Puerto BA r=20, Evolvere r=15) can still read "near"
 * when you're alongside instead of never getting closer than their radius.
 */
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

// ----------------------------------------------------- IALA lateral marks ----
// Decorative navigation buoys (no collision, no CTA), pairs along the Canal
// Mitre. IALA Region B (Argentina): sailing downstream toward Km 12, RED to
// starboard (south, +z) and GREEN to port (north).
export type NavBuoy = { id: string; side: "red" | "green"; pos: [number, number, number] };

export const NAV_BUOYS: NavBuoy[] = [
  { id: "nav-r1", side: "red", pos: [62, 0, 63] },
  { id: "nav-g1", side: "green", pos: [62, 0, 58] },
  { id: "nav-r2", side: "red", pos: [68, 0, 68] },
  { id: "nav-g2", side: "green", pos: [68, 0, 63] },
  { id: "nav-r3", side: "red", pos: [73, 0, 74] },
  { id: "nav-g3", side: "green", pos: [73, 0, 69] },
  { id: "nav-r4", side: "red", pos: [78, 0, 80] },
  { id: "nav-g4", side: "green", pos: [78, 0, 75] },
  { id: "nav-r5", side: "red", pos: [82, 0, 86] },
  { id: "nav-g5", side: "green", pos: [82, 0, 81] },
  { id: "nav-r6", side: "red", pos: [85, 0, 91] },
  { id: "nav-g6", side: "green", pos: [85, 0, 86] },
];
