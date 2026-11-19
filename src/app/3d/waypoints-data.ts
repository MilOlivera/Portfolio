// Single source of truth for everything placed on the river. Pure data (no
// three.js) so the DOM HUD and the physics can import it without the 3D bundle.

export type WaypointKind = "landmark" | "buoy" | "ship" | "mega" | "egg";

export type Waypoint = {
  id: string;
  kind: WaypointKind;
  title: string;
  subtitle?: string; // small text under the label
  pos: [number, number, number];
  rotation?: number; // yaw, radians (ships only)
  color?: string; // three.js material color (hex — CSS tokens don't reach WebGL)
  pulse?: boolean;
  dim?: boolean; // WIP (e.g. relojes)
  struck?: boolean; // label crossed out ("not the destination")
  collisionRadius: number; // 0 = doesn't block (light buoys)
  clickable?: boolean; // for 3D-4b (modals)
};

export const WAYPOINTS: Waypoint[] = [
  // LANDMARKS (geography, not projects)
  { id: "campana-axion", kind: "landmark", title: "TERMINAL AXION", subtitle: "Km 96.5 · CARGA IFO 380 ✓", pos: [-120, 0, -80], collisionRadius: 8 },
  { id: "tenaris", kind: "landmark", title: "TENARIS SIDERCA", subtitle: "Km 98.5", pos: [-115, 0, -92], collisionRadius: 10 },
  { id: "escobar", kind: "landmark", title: "PUERTO ESCOBAR", subtitle: "Km ~70", pos: [-80, 0, -40], collisionRadius: 6 },
  { id: "km12-ba", kind: "landmark", title: "Km 12 — Puerto BA", subtitle: "NO ES EL DESTINO", pos: [30, 0, 20], collisionRadius: 15, color: "#aa2222", struck: true },
  { id: "recalada", kind: "landmark", title: "RECALADA", subtitle: "pilot station", pos: [80, 0, 50], collisionRadius: 3 },
  { id: "puerto-lp", kind: "landmark", title: "PUERTO LA PLATA", subtitle: "10.36m · canal 2.5nm", pos: [100, 0, 60], collisionRadius: 10 },

  // BUOYS (standalone public projects) — light, sail right through them
  { id: "finanzas", kind: "buoy", title: "Finanzas Personales", pos: [-20, 0, -5], color: "#FFB020", pulse: true, collisionRadius: 0, clickable: true },
  { id: "relojes", kind: "buoy", title: "E-commerce Relojes", subtitle: "WIP", pos: [10, 0, 10], color: "#FFB020", pulse: true, dim: true, collisionRadius: 0, clickable: true },

  // CLIENT SHIPS (Zona Común)
  { id: "ospatrones", kind: "ship", title: "OSPATRONES", pos: [115, 0, 75], rotation: -0.3, color: "#00FF88", collisionRadius: 5, clickable: true },
  { id: "marpla", kind: "ship", title: "MARPLA", pos: [125, 0, 80], rotation: 0.5, color: "#00FF88", collisionRadius: 5, clickable: true },
  { id: "musacchio", kind: "ship", title: "MUSACCHIO", pos: [120, 0, 90], rotation: 0.1, color: "#00FF88", collisionRadius: 5, clickable: true },

  // MEGA SHIP
  { id: "evolvere", kind: "mega", title: "EVOLVERE", pos: [140, 0, 85], rotation: -0.15, color: "#25DB79", collisionRadius: 12, clickable: true },

  // EASTER EGG (placeholder — real names coming later)
  { id: "straits-sky", kind: "egg", title: "STRAITS SKY", subtitle: "bunker supply", pos: [130, 0, 95], rotation: -0.1, color: "#777777", collisionRadius: 4 },
];

/** Approximate radius of the B/T NANY (hull 8 long) for collisions. */
export const BOAT_RADIUS = 4;

/** Range (to the waypoint's edge) at which the HUD highlights it. */
export const NEAR_DISTANCE = 10;

/**
 * Nearest waypoint measured to its EDGE (center distance − collisionRadius),
 * so big blocking ones (Km 12 r=15, Evolvere r=12) can still read "< 10" when
 * you're alongside instead of never getting closer than their radius.
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
