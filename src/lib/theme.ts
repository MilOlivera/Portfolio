// Shared between server (layout inline scripts) and client components.
// Must NOT be a "use client" module: the layout needs the raw strings.

export type Theme = "green" | "amber";

export const THEME_STORAGE_KEY = "milton-theme";

/**
 * Runs synchronously in <head> before first paint so a saved amber theme
 * never flashes green.
 */
export const preHydrationScript = `(function(){try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="amber")document.documentElement.setAttribute("data-theme","amber")}catch(e){}})()`;
