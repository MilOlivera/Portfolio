"use client";

import { useEffect, useRef, useState } from "react";
import { findProject, requestDemoMailto, type Project } from "@/lib/projects";
import { useBoatTelemetry } from "./BoatTelemetry";
import { WAYPOINTS, type Waypoint } from "./waypoints-data";

const POLL_MS = 100;
const ABEAM_MIN = 1.3; // rad (~75°) off the bow…
const ABEAM_MAX = 1.84; // …to ~105°: the buoy is "al través"
const TRIGGER_DISTANCE = 15;
// Abeam lasts well under a second at full speed, so once triggered the CTA
// stays until the boat opens the distance past this.
const RELEASE_DISTANCE = 20;

const TARGETS = WAYPOINTS.filter((w) => w.alTravesDetection);

/** Angle of the buoy relative to the bow, normalized to [-π, π]. */
function bearingOffBow(w: Waypoint, x: number, z: number, heading: number) {
  const toBuoy = Math.atan2(w.pos[2] - z, w.pos[0] - x);
  const bow = Math.atan2(-Math.sin(heading), Math.cos(heading)); // forward = (cos h, -sin h)
  let d = toBuoy - bow;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

type Action = { label: string; href?: string; external?: boolean; disabled?: boolean };

function projectAction(p: Project | undefined): Action {
  if (!p) return { label: "PRÓXIMAMENTE", disabled: true };
  if (p.visibility === "confidential") return { label: "SOLICITAR DEMO ✉", href: requestDemoMailto(p) };
  if (p.status === "rebuilding") return { label: "REBUILDING…", disabled: true };
  return p.url ? { label: "ABRIR PROYECTO ↗", href: p.url, external: true } : { label: "PRÓXIMAMENTE", disabled: true };
}

/**
 * "Al través" interaction: when a project buoy comes abeam (~90° off the bow)
 * within 15 u, a CTA appears; VER PROYECTO opens a modal with the project from
 * src/lib/projects.ts (open link if public, mailto demo request if confidential).
 */
export default function AlTravesDetector() {
  const telemetry = useBoatTelemetry();
  const [active, setActive] = useState<Waypoint | null>(null);
  const [modal, setModal] = useState<Waypoint | null>(null);
  const activeRef = useRef<Waypoint | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const { x, z, heading } = telemetry.current;
      let next = activeRef.current;
      // Release the latched one once we're clear of it
      if (next && Math.hypot(next.pos[0] - x, next.pos[2] - z) > RELEASE_DISTANCE) next = null;
      for (const w of TARGETS) {
        const dist = Math.hypot(w.pos[0] - x, w.pos[2] - z);
        const off = Math.abs(bearingOffBow(w, x, z, heading));
        if (dist < TRIGGER_DISTANCE && off > ABEAM_MIN && off < ABEAM_MAX) next = w;
      }
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [telemetry]);

  // Esc closes the modal
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const activeProject = active?.projectId ? findProject(active.projectId) : undefined;
  const modalProject = modal?.projectId ? findProject(modal.projectId) : undefined;
  const action = projectAction(modalProject);

  return (
    <>
      {/* CTA (bottom-center) while a project buoy is abeam */}
      <div
        aria-hidden={!active}
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4 transition-all duration-300 ${
          active && !modal ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {active && (
          <div className="pointer-events-auto w-full max-w-sm border border-green bg-bg/85 p-4 font-mono backdrop-blur">
            <p className="text-sm font-bold tracking-wider text-green">◉ {active.title.toUpperCase()}</p>
            <p className="mt-1 line-clamp-2 font-sans text-xs text-text-mid">
              {activeProject?.blurb ?? active.subtitle}
            </p>
            <button
              type="button"
              onClick={() => setModal(active)}
              className="mt-3 cursor-pointer border border-green px-3 py-1.5 text-xs font-bold tracking-wider text-green transition-colors hover:bg-green hover:text-bg"
            >
              [ VER PROYECTO ]
            </button>
          </div>
        )}
      </div>

      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="altraves-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-bg/70 px-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="relative w-full max-w-lg border border-green bg-bg-elev p-6 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              autoFocus
              onClick={() => setModal(null)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 cursor-pointer text-text-mute transition-colors hover:text-green"
            >
              [x]
            </button>
            <p className="text-[11px] tracking-widest text-text-mute uppercase">{modal.subtitle}</p>
            <h2 id="altraves-title" className="mt-2 text-lg font-bold text-green">
              {modalProject?.title ?? modal.title}
            </h2>
            {modalProject && (
              <>
                <p className="mt-3 font-sans text-sm leading-relaxed text-text-mid">{modalProject.blurb}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {modalProject.tags.map((t) => (
                    <li key={t} className="border border-border-strong px-2 py-0.5 text-xs text-text-mid">
                      {t}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="mt-6">
              {action.disabled || !action.href ? (
                <span className="inline-block border border-border-strong px-4 py-2 text-sm text-text-mute">
                  {action.label}
                </span>
              ) : (
                <a
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className="inline-block border border-green px-4 py-2 text-sm font-bold text-green transition-colors hover:bg-green hover:text-bg"
                >
                  {action.label}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
