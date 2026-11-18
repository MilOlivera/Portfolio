import CornerBrackets from "./CornerBrackets";
import Mode3DButton from "./Mode3DButton";
import PortraitCard from "./PortraitCard";

const STATUS = ["SESSION: 0x8af2", "LOC: -34.80°S -58.26°W", "PING: 12ms"];

export default function Hero() {
  return (
    <section id="top" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pt-10 pb-16 sm:px-6 sm:pt-14">
      {/* Status bar */}
      <p className="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-text-mute">
        <span className="flex items-center gap-1.5 text-green">
          <span aria-hidden>●</span> SYSTEM ONLINE
        </span>
        {STATUS.map((s) => (
          <span key={s} className="flex items-center gap-2">
            <span className="text-text-dim" aria-hidden>
              ·
            </span>
            {s}
          </span>
        ))}
      </p>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1.6fr_0.8fr]">
        <div>
          <h1 className="font-mono text-4xl leading-tight font-bold text-text sm:text-5xl lg:text-6xl">
            <span className="text-text-mute">&gt;</span> milton_olivera
            <br />
            <span className="text-green glow-text">full_stack</span>
            .dev
            <span aria-hidden className="ml-1 inline-block text-green animate-blink">
              █
            </span>
          </h1>

          <p className="mt-8 max-w-2xl font-sans text-base leading-relaxed text-text-mute sm:text-lg">
            9 años navegando ríos como Oficial Fluvial. 5 años construyendo software con React,
            Next.js, TypeScript y PostgreSQL. 15+ productos en producción, 3 negocios propios, y una
            tesis pendiente de defender en Teclab.{" "}
            <span className="text-text">Entrego productos, no promesas.</span>
          </p>

          <div className="mt-10 flex flex-wrap gap-3 font-mono text-sm">
            <a
              href="#projects"
              className="border border-green bg-green px-5 py-3 font-semibold text-bg transition-shadow hover:glow-box"
            >
              ls ./projects →
            </a>
            <a
              href="#contact"
              className="border border-border-strong px-5 py-3 text-text transition-colors hover:border-green hover:text-green"
            >
              ./contact.sh
            </a>
            <Mode3DButton className="relative px-5 py-3 text-text-mute transition-colors hover:text-green">
              <CornerBrackets size="size-2" glow={false} />[ render 3D mode ]
            </Mode3DButton>
          </div>
        </div>

        <PortraitCard />
      </div>
    </section>
  );
}
