"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

export type { Theme };

const THEME_EVENT = "milton-theme-change";

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "amber" ? "amber" : "green";
  } catch {
    return "green";
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "amber") root.setAttribute("data-theme", "amber");
  else root.removeAttribute("data-theme");
}

function subscribe(onChange: () => void) {
  // Same tab: custom event. Other tabs: native storage event.
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) onChange();
  };
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server snapshot is always "green"; the client switches after hydration
  // without a mismatch. The DOM attribute is already correct thanks to the
  // inline script, so there's no visual flash.
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => "green" as const);

  // Keep <html data-theme> in sync. Also re-applies it after React's
  // StrictMode dev remount, which resets attributes on <html>.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage unavailable (private mode): theme still applies for this visit.
    }
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
