// Pure data (no three.js) so the DOM HUD can import it without pulling the
// 3D bundle. Waypoints.tsx renders these; Hud.tsx finds the nearest one.

export type WaypointKind = "buoy" | "ship" | "mega";

export type Waypoint = {
  id: string;
  kind: WaypointKind;
  title: string;
  pos: [number, number, number];
  rotation?: number; // yaw, radians
  color: string; // three.js material color (hex — CSS tokens don't reach WebGL)
  pulse?: boolean;
  dim?: boolean;
};

// Rada La Plata group sits in open water (z < 50, where the north shore starts).
export const WAYPOINTS: Waypoint[] = [
  // Buoys: standalone public projects
  { id: "finanzas", kind: "buoy", title: "Finanzas Personales", pos: [-15, 0.5, 5], color: "#FFB020", pulse: true },
  { id: "relojes", kind: "buoy", title: "E-commerce Relojes [WIP]", pos: [20, 0.5, 10], color: "#FFB020", pulse: true, dim: true },

  // Client ships anchored at Rada La Plata
  { id: "ospatrones", kind: "ship", title: "OSPATRONES", pos: [95, 0.5, 13], rotation: -0.3, color: "#00FF88" },
  { id: "marpla", kind: "ship", title: "MARPLA", pos: [105, 0.5, 28], rotation: 0.5, color: "#00FF88" },
  { id: "musacchio", kind: "ship", title: "MUSACCHIO", pos: [85, 0.5, 33], rotation: 0.1, color: "#00FF88" },

  // Flagship destination
  { id: "evolvere", kind: "mega", title: "EVOLVERE", pos: [115, 0.5, 43], rotation: -0.15, color: "#25DB79" },
];

/** Range at which the HUD highlights a waypoint (interaction lands in 3D-4b). */
export const NEAR_DISTANCE = 10;

export function nearestWaypoint(x: number, z: number) {
  let best = WAYPOINTS[0];
  let bestDist = Infinity;
  for (const w of WAYPOINTS) {
    const d = Math.hypot(w.pos[0] - x, w.pos[2] - z);
    if (d < bestDist) {
      best = w;
      bestDist = d;
    }
  }
  return { waypoint: best, distance: bestDist };
}
