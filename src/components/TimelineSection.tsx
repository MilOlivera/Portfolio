"use client";

import { useState } from "react";
import { TIMELINE, TRACK_LABEL, TRACK_ORDER, type TimelineEntry, type TimelineTrack } from "@/lib/timeline";
import FilterTabs from "./FilterTabs";
import SectionHeader from "./SectionHeader";

type Filter = TimelineTrack | "all";
const FILTERS: Filter[] = ["all", ...TRACK_ORDER];

// Entries per track, sorted by `order` descending (computed once)
const BY_TRACK = Object.fromEntries(
  TRACK_ORDER.map((track) => [
    track,
    TIMELINE.filter((e) => e.track === track).sort((a, b) => b.order - a.order),
  ]),
) as Record<TimelineTrack, TimelineEntry[]>;

function Entry({ entry }: { entry: TimelineEntry }) {
  return (
    <li className="grid grid-cols-[72px_14px_1fr] items-start gap-3 border-b border-dashed border-border py-3.5 sm:grid-cols-[110px_14px_1fr] sm:gap-4">
      <span className="pt-0.5 font-mono text-xs text-text-mute">{entry.date}</span>
      <span className="flex justify-center pt-1">
        <span
          aria-hidden
          className={`size-2.5 rounded-full border-2 border-green ${
            entry.current ? "bg-green shadow-[0_0_10px_var(--green-glow)]" : ""
          }`}
        />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-sm font-semibold text-text">
          {entry.role}
          {entry.current && <span className="sr-only"> (actual)</span>}
        </p>
        <p className="mt-0.5 font-sans text-sm text-text-mid">{entry.where}</p>
      </div>
    </li>
  );
}

export default function TimelineSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const tracks = filter === "all" ? TRACK_ORDER : [filter];
  const count = tracks.reduce((n, t) => n + BY_TRACK[t].length, 0);

  return (
    <section id="experience" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <SectionHeader
        path="./experience"
        subtitle="trayectoria"
        badgeLive
        badge={
          <>
            <span className="text-green">{count}</span> ENTRIES
          </>
        }
      />

      <FilterTabs options={FILTERS} value={filter} onChange={setFilter} label="Filtrar trayectoria" />

      <div className="space-y-8">
        {tracks.map((track) => (
          <div key={track}>
            {filter === "all" && (
              <h3 className="mb-2 font-mono text-xs tracking-[0.25em] text-phosphor">
                ═══ {TRACK_LABEL[track]} ═══
              </h3>
            )}
            <ul aria-label={TRACK_LABEL[track]}>
              {BY_TRACK[track].map((entry) => (
                <Entry key={entry.id} entry={entry} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
