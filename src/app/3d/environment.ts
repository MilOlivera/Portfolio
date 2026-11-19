// Shared look and layout of the river scene. Three.js can't read the CSS
// theme tokens, so these are hex/number constants by design.

/** Sun position used by <Sky />, the directional light and the water shader. */
export const SUN_POSITION: [number, number, number] = [100, 20, 100];

/** Hazy, pale-yellow horizon: fog color + distant water blend. */
export const HORIZON_HEX = "#c4a885";

export const FOG_NEAR = 60;
export const FOG_FAR = 200;

export const WATER_SIZE = 300;
export const WATER_SEGMENTS = 128;

// ---------------------------------------------------------------- land ----
// Axis-aligned land rectangles (world X/Z, 1 km = 2 units, -Z = north).
// Shoreline.tsx draws them and BoatControls blocks the boat SHORE_MARGIN
// before their edge. Straight banks approximate the real (winding) river.
export type LandRect = { minX: number; maxX: number; minZ: number; maxZ: number };

export const LAND: LandRect[] = [
  { minX: -30, maxX: 250, minZ: -70, maxZ: -20 }, // north bank
  { minX: -12, maxX: 12, minZ: -20, maxZ: -5.5 }, // Campana quay (AXION / Tenaris)
  { minX: -30, maxX: 250, minZ: 170, maxZ: 240 }, // south bank
];

/** Sailing area (covers the whole real route with margin). */
export const WORLD_BOUNDS = { minX: -20, maxX: 240, minZ: -20, maxZ: 180 };

/** Land surface sits just above the tallest wave crest (~0.25). */
export const BANK_Y = 0.3;

/** Boat center stops this far from a land edge. */
export const SHORE_MARGIN = 2;
