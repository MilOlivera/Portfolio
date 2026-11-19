// Single source of truth for everything placed on the river. Pure data (no
// three.js) so the DOM HUD and the physics can import it without the 3D bundle.
//
// REAL-WORLD SCALE: 1 km = 2 units. Origin = Terminal AXION (Campana).
// Axes: -Z = north, +Z = south (downstream), +X = east.

export type WaypointKind = "landmark" | "buoy" | "ship" | "mega" | "egg";

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
  clickable?: boolean; // for 3D-4b (modals)
};

export const WAYPOINTS: Waypoint[] = [
  // GEOGRAPHIC LANDMARKS
  { id: "axion", kind: "landmark", title: "TERMINAL AXION", subtitle: "Km 96.5 · CARGA IFO 380 ✓", pos: [0, 0, 0], site: [3, 0, -8], collisionRadius: 10 },
  { id: "tenaris", kind: "landmark", title: "TENARIS SIDERCA", subtitle: "Km 98.5", pos: [-3, 0, -1], site: [-7, 0, -8], collisionRadius: 12 },
  { id: "escobar", kind: "landmark", title: "PUERTO ESCOBAR", subtitle: "Km ~70", pos: [26, 0, 44], collisionRadius: 8 },
  { id: "km12-ba", kind: "landmark", title: "Km 12 — Puerto BA", subtitle: "NO ES EL DESTINO", pos: [85, 0, 89], collisionRadius: 18, color: "#aa2222", struck: true },
  { id: "puerto-ba", kind: "landmark", title: "PUERTO BUENOS AIRES", subtitle: "landmark referencial", pos: [104, 0, 100], collisionRadius: 20 },
  { id: "recalada", kind: "landmark", title: "RECALADA", subtitle: "pilot station", pos: [180, 0, 130], collisionRadius: 4 },
  { id: "puerto-lp", kind: "landmark", title: "PUERTO LA PLATA", subtitle: "10.36m · canal 2.5nm", pos: [194, 0, 160], collisionRadius: 15 },

  // PUBLIC-PROJECT BUOYS (channel between Km 48 and Km 12) — sail right through
  // Relojes moved from (79, 81), which fell inside Km 12's collision circle.
  { id: "finanzas", kind: "buoy", title: "Finanzas Personales", pos: [73, 0, 70], color: "#FFB020", pulse: true, collisionRadius: 0, clickable: true },
  { id: "relojes", kind: "buoy", title: "E-commerce Relojes", subtitle: "WIP", pos: [62, 0, 62], color: "#FFB020", pulse: true, dim: true, collisionRadius: 0, clickable: true },

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
