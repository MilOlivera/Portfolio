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
// The river shape (channel, basin, anchorage, quay, Delta) lives in
// river-geometry.ts; terrain and collision both read it.

/** Sailing area: whole route + the upstream reach under the Zárate bridge. */
export const WORLD_BOUNDS = { minX: -20, maxX: 240, minZ: -70, maxZ: 180 };

/** Land surface sits just above the tallest wave crest (~0.25). */
export const BANK_Y = 0.3;

/** Boat center stops this far inside the waterline (hull half-beam 0.7). */
export const SHORE_MARGIN = 1;

/** Terrain extent (covers the whole world plus a fogged rim). */
export const TERRAIN = { minX: -40, maxX: 260, minZ: -80, maxZ: 200, cell: 1.5 };
