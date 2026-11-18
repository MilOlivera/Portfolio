import CornerBrackets from "./CornerBrackets";

const ROWS = [
  { k: "USER", v: "M.OLIVERA" },
  { k: "ROLE", v: "full_stack.dev" },
  { k: "LOC", v: "Adrogué, AR" },
];

export default function PortraitCard() {
  return (
    <div className="relative isolate mx-auto w-[240px]">
      {/* Breathing aura behind the card */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-full bg-green-glow blur-3xl animate-breathe"
      />

      <figure className="relative border border-border-strong bg-bg-elev p-2">
        <CornerBrackets size="size-4" />

        {/* Top strip */}
        <div className="mb-2 flex items-center justify-between px-1 text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-green">
            <span className="inline-block size-1.5 rounded-full bg-green animate-pulse-dot" aria-hidden />
            LIVE
          </span>
          <span className="text-text-mute">ID.0x8af2</span>
        </div>

        {/* Photo placeholder (real photo arrives in Phase 6) */}
        <div className="flex aspect-[340/700] w-full items-center justify-center border border-border bg-surface text-xs tracking-[0.4em] text-text-dim">
          PHOTO
        </div>

        {/* Footer rows */}
        <figcaption className="mt-2 space-y-1 border-t border-border px-1 pt-2 text-[11px]">
          {ROWS.map((r) => (
            <div key={r.k} className="flex justify-between gap-2">
              <span className="text-text-dim">{r.k}:</span>
              <span className="text-text">{r.v}</span>
            </div>
          ))}
        </figcaption>
      </figure>
    </div>
  );
}
