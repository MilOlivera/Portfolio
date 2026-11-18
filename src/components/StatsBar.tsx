import CornerBrackets from "./CornerBrackets";

const STATS = [
  { value: "5+", label: "YEARS_DEV" },
  { value: "9", label: "YEARS_MARINE" },
  { value: "12", label: "PROD_APPS" },
  { value: "3", label: "OWN_BIZ" },
];

export default function StatsBar() {
  return (
    <section aria-label="Estadísticas" className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      <div className="relative border border-border bg-bg-elev/60">
        <CornerBrackets />
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col items-center gap-2 px-4 py-8 text-center ${
                i % 2 === 1 ? "border-l border-border" : ""
              } ${i >= 2 ? "border-t border-border md:border-t-0" : ""} ${
                i === 2 ? "md:border-l" : ""
              }`}
            >
              {/* dt must precede dd in markup; order-last keeps the number on top */}
              <dt className="order-last font-mono text-[11px] tracking-[0.2em] text-text-mute">
                {s.label}
              </dt>
              <dd className="font-mono text-4xl font-bold text-green glow-text sm:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
