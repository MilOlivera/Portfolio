// Shared look and layout of the river scene. Three.js can't read the CSS
// theme tokens, so these are hex/number constants by design.

/** Sun position used by <Sky />, the directional light and the water shader. */
export const SUN_POSITION: [number, number, number] = [100, 20, 100];

/** Hazy, pale-yellow horizon: fog color + distant water blend. */
export const HORIZON_HEX = "#c4a885";

export const FOG_NEAR = 60;
export const FOG_FAR = 200;

// Water plane follows the boat; 1-unit cells so the short river chop
// (1 unit = 20 m) is resolved without aliasing.
export const WATER_SIZE = 256;
export const WATER_SEGMENTS = 256;
/** Calm river: crests of ~1.5 m (0.075 u). */
export const WAVE_HEIGHT = 0.03;

// ---------------------------------------------------------------- land ----
// The river shape (channel, basins, estuary, canals, Delta) lives in
// river-geometry.ts; terrain and collision both read it.

/** Sailing area: the whole route, a bit upstream of the turning buoy, the anchorage. */
export const WORLD_BOUNDS = { minX: -30, maxX: 170, minZ: -30, maxZ: 460 };

/** Land surface: low Delta banks, just above the wave crests. */
export const BANK_Y = 0.12;

/** Boat center stops this far inside the waterline (hull half-beam 0.35). */
export const SHORE_MARGIN = 0.6;
