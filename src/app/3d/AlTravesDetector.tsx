"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AlTravesCarousel, { HOLD_MS } from "./AlTravesCarousel";
import { useBoatTelemetry } from "./BoatTelemetry";
import { PROJECT_MEDIA, demoMailto } from "./project-media";
import { zToKm } from "./scale";
import {
  AUTO_SLOW_CANCEL_EVENT,
  AUTO_SLOW_EVENT,
  OPEN_WAYPOINT_EVENT,
  WAYPOINTS,
  type Waypoint,
} from "./waypoints-data";

const POLL_MS = 100;
const ABEAM_MIN = 1.3; // rad (~75°) off the bow…
const ABEAM_MAX = 1.84; // …to ~105°: the waypoint is "al través"
const TRIGGER_DISTANCE = 8; // abeam buoys and Zona Común ships (PROXIMITY_DISTANCE)
// Once a waypoint has fired (or been dismissed) it can't fire again until the
// boat opens the distance past this.
const RELEASE_DISTANCE = 12;
const AUTO_SLOW_KN = 2;

const TARGETS = WAYPOINTS.filter((w) => w.alTravesDetection || w.proximityDetection);

/** Angle of the waypoint relative to the bow, normalized to [-π, π]. */
function bearingOffBow(w: Waypoint, x: number, z: number, heading: number) {
  const toIt = Math.atan2(w.pos[2] - z, w.pos[0] - x);
  const bow = Math.atan2(-Math.sin(heading), Math.cos(heading)); // forward = (cos h, -sin h)
  let d = toIt - bow;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

function waypointLabel(w: Waypoint) {
  if (w.buoyType === "special") return "Baliza Especial Amarilla";
  if (w.buoyType === "cardinal-east") return "Boya Cardinal Este";
  return `${w.title} · fondeado en Zona Común`;
}

/**
 * Waypoint interactions:
 *  · project buoys abeam (~90° off the bow, < 8 u) and Zona Común ships within
 *    8 u (or clicked) → the boat auto-slows to 2 kn and AlTravesCarousel opens
 *    for 20 s (SEGUIR / timeout → resume).
 *  · the FSRU (technical waypoint) abeam → small CTA; clicking the model or
 *    the CTA opens its technical sheet.
 */
export default function AlTravesDetector() {
  const telemetry = useBoatTelemetry();
  const [carousel, setCarousel] = useState<Waypoint | null>(null);
  const [cta, setCta] = useState<Waypoint | null>(null); // technical waypoint abeam
  const [sheet, setSheet] = useState<Waypoint | null>(null); // technical modal
  const carouselRef = useRef<Waypoint | null>(null);
  const ctaRef = useRef<Waypoint | null>(null);
  const fired = useRef(new Set<string>()); // ids waiting to be cleared by distance

  const openCarousel = useCallback((w: Waypoint) => {
    if (!w.media || !PROJECT_MEDIA[w.media]) return;
    carouselRef.current = w;
    fired.current.add(w.id);
    setCarousel(w);
    window.dispatchEvent(new CustomEvent(AUTO_SLOW_EVENT, { detail: { toKn: AUTO_SLOW_KN, holdMs: HOLD_MS } }));
  }, []);

  const closeCarousel = useCallback(() => {
    carouselRef.current = null;
    setCarousel(null);
    window.dispatchEvent(new CustomEvent(AUTO_SLOW_CANCEL_EVENT));
  }, []);

  // Detection loop
  useEffect(() => {
    const id = window.setInterval(() => {
      const { x, z, heading } = telemetry.current;

      for (const w of TARGETS) {
        const dist = Math.hypot(w.pos[0] - x, w.pos[2] - z);
        if (dist > RELEASE_DISTANCE) {
          fired.current.delete(w.id);
          if (ctaRef.current === w) {
            ctaRef.current = null;
            setCta(null);
          }
          continue;
        }
        if (fired.current.has(w.id) || dist >= TRIGGER_DISTANCE) continue;

        const off = Math.abs(bearingOffBow(w, x, z, heading));
        const triggered = w.proximityDetection || (off > ABEAM_MIN && off < ABEAM_MAX);
        if (!triggered) continue;

        if (w.media) {
          if (!carouselRef.current) openCarousel(w);
        } else if (w.info) {
          fired.current.add(w.id);
          ctaRef.current = w;
          setCta(w);
        }
      }
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [telemetry, openCarousel]);

  // Clicking a 3D model (Zona Común ships, the FSRU) opens it directly
  useEffect(() => {
    const onOpen = (e: Event) => {
      const w = WAYPOINTS.find((wp) => wp.id === (e as CustomEvent<string>).detail);
      if (!w) return;
      if (w.media) {
        if (carouselRef.current) closeCarousel();
        openCarousel(w);
      } else if (w.info) setSheet(w);
    };
    window.addEventListener(OPEN_WAYPOINT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_WAYPOINT_EVENT, onOpen);
  }, [openCarousel, closeCarousel]);

  // Esc closes the technical sheet
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const media = carousel?.media ? PROJECT_MEDIA[carousel.media] : undefined;

  return (
    <>
      {carousel && media && (
        <AlTravesCarousel
          key={carousel.id}
          projectId={media.id}
          waypointKm={Math.max(0, Math.round(zToKm(carousel.pos[2])))}
          waypointName={waypointLabel(carousel)}
          onSeguir={closeCarousel}
          onVerProyecto={
            media.isPublic && media.url ? () => window.open(media.url, "_blank", "noopener,noreferrer") : undefined
          }
          onSolicitarDemo={() => {
            window.location.href = demoMailto(media);
          }}
        />
      )}

      {/* Technical waypoint abeam (FSRU) */}
      <div
        aria-hidden={!cta}
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4 transition-all duration-300 ${
          cta && !sheet && !carousel ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {cta && (
          <div className="pointer-events-auto w-full max-w-sm border border-green bg-bg/85 p-4 font-mono backdrop-blur">
            <p className="text-sm font-bold tracking-wider text-green">◉ {cta.title.toUpperCase()}</p>
            <p className="mt-1 line-clamp-2 font-sans text-xs text-text-mid">{cta.info?.[1]?.[1] ?? cta.subtitle}</p>
            <button
              type="button"
              onClick={() => setSheet(cta)}
              className="mt-3 cursor-pointer border border-green px-3 py-1.5 text-xs font-bold tracking-wider text-green transition-colors hover:bg-green hover:text-bg"
            >
              [ VER FICHA TÉCNICA ]
            </button>
          </div>
        )}
      </div>

      {sheet?.info && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          className="fixed inset-0 z-40 flex items-center justify-center bg-bg/70 px-4 backdrop-blur-sm"
          onClick={() => setSheet(null)}
        >
          <div
            className="relative w-full max-w-lg border border-green bg-bg-elev p-6 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              autoFocus
              onClick={() => setSheet(null)}
              aria-label="Cerrar"
              className="absolute top-3 right-3 cursor-pointer text-text-mute transition-colors hover:text-green"
            >
              [x]
            </button>
            <p className="text-[11px] tracking-widest text-text-mute uppercase">{sheet.subtitle}</p>
            <h2 id="sheet-title" className="mt-2 text-lg font-bold text-green">
              {sheet.title}
            </h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-border pt-4 text-sm">
              {sheet.info.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-text-mute">{k}</dt>
                  <dd className="text-text">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
