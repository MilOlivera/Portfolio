// Shared between server (layout inline scripts) and client components.
// Must NOT be a "use client" module: the layout needs the raw strings.

export type Theme = "green" | "amber";

export const THEME_STORAGE_KEY = "milton-theme";
export const BOOT_STORAGE_KEY = "milton-booted";

/**
 * Runs synchronously in <head> before first paint:
 * - applies a saved amber theme so it never flashes green
 * - marks the boot sequence as seen this session so its overlay is hidden by CSS
 */
export const preHydrationScript = `(function(){var d=document.documentElement;try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="amber")d.setAttribute("data-theme","amber")}catch(e){}try{if(sessionStorage.getItem("${BOOT_STORAGE_KEY}"))d.setAttribute("data-booted","")}catch(e){}})()`;
