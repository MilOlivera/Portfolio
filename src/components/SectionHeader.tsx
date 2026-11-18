import type { ReactNode } from "react";
import CornerBrackets from "./CornerBrackets";

// Shared "./section — subtitle ............ BADGE" header with corner brackets.
export default function SectionHeader({
  path,
  subtitle,
  badge,
  badgeLive = false,
}: {
  path: string;
  subtitle?: string;
  badge?: ReactNode;
  badgeLive?: boolean; // announce badge changes (e.g. filter counters)
}) {
  return (
    <div className="relative mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-4 py-4">
      <CornerBrackets />
      <h2 className="font-mono text-lg font-bold text-text sm:text-xl">
        <span className="text-green">{path}</span>
        {subtitle && <span className="text-text-mute"> — {subtitle}</span>}
      </h2>
      {badge && (
        <p
          role={badgeLive ? "status" : undefined}
          className="font-mono text-[11px] tracking-widest text-text-mute uppercase"
        >
          {badge}
        </p>
      )}
    </div>
  );
}
