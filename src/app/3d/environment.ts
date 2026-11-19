// Shared look of the river scene. Three.js can't read the CSS theme tokens,
// so these are hex/number constants by design.

/** Sun position used by <Sky />, the directional light and the water shader. */
export const SUN_POSITION: [number, number, number] = [100, 20, 100];

/** Hazy, pale-yellow horizon: fog color + distant water blend. */
export const HORIZON_HEX = "#c4a885";

export const FOG_NEAR = 60;
export const FOG_FAR = 200;

export const WATER_SIZE = 300;
export const WATER_SEGMENTS = 128;
