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
// Axis-aligned land rectangles (world X/Z). Shoreline.tsx draws them and
// BoatControls blocks the boat SHORE_MARGIN before their edge.
// The channel runs along X between the banks (z ∈ -50..50). East of x=60 the
// north bank opens into the Zona Común anchorage (Rada La Plata) so the client
// ships there are reachable; a strip of land closes it far to the north.
export type LandRect = { minX: number; maxX: number; minZ: number; maxZ: number };

export const LAND: LandRect[] = [
  { minX: -140, maxX: 60, minZ: 50, maxZ: 130 }, // north bank (Campana → Buenos Aires)
  { minX: 60, maxX: 140, minZ: 105, maxZ: 130 }, // backland behind the anchorage
  { minX: -140, maxX: 140, minZ: -130, maxZ: -50 }, // south bank
];

/** Land surface sits just above the tallest wave crest (~0.25). */
export const BANK_Y = 0.3;

/** Boat center stops this far from a land edge (z > 48 on a bank at z=50). */
export const SHORE_MARGIN = 2;
