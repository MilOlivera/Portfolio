"use client";

import type { ReactNode } from "react";

export const MODE_3D_MESSAGE = "Modo 3D viene en la Fase 2 del proyecto";

// Only client island needed for the disabled 3D mode: shows an alert on click.
export default function Mode3DButton({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => window.alert(MODE_3D_MESSAGE)}
    >
      {children}
    </button>
  );
}
