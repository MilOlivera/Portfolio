// Temporary Phase 1 placeholder: verifies tokens, fonts and overlays.
// Replaced by the composed sections from Phase 2 on.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-4 py-24 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-text-mute">
        <span className="text-green">●</span> system online
      </p>
      <h1 className="text-4xl font-bold text-text sm:text-6xl">
        milton<span className="text-green glow-text">.olivera</span>
      </h1>
      <p className="max-w-xl font-sans text-base leading-relaxed text-text-mute">
        Full-stack developer &amp; Marino Mercante. Fase 1: tokens, tipografías, scanlines, grid,
        ThemeProvider y boot sequence.
      </p>
      <div className="flex flex-wrap gap-2 text-xs">
        {["bg-surface", "bg-bg-elev", "bg-green-soft", "bg-border-strong"].map((c) => (
          <span key={c} className={`${c} border border-border px-3 py-2 text-text-mute`}>
            {c}
          </span>
        ))}
      </div>
    </main>
  );
}
