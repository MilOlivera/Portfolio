import { EMAIL } from "@/lib/site";
import { WORKFLOW, type WorkflowStep } from "@/lib/workflow";
import CornerBrackets from "./CornerBrackets";
import SectionHeader from "./SectionHeader";

const ICON_PATHS: Record<WorkflowStep["icon"], string[]> = {
  coin: [
    "M12 6v12M8 10c0-1.5 1-2 4-2s4 1 4 2.5-1 2.5-4 2.5-4 1-4 2.5 1 2.5 4 2.5 4-.5 4-2",
    "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z",
  ],
  clock: ["M12 5a8 8 0 110 16 8 8 0 010-16z", "M12 9v4l2.5 2.5M12 3V1M8 1h8"],
  package: ["M3 7l9-4 9 4v10l-9 4-9-4V7z", "M3 7l9 4 9-4M12 11v10"],
  loop: ["M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5", "M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5"],
  gear: [
    "M12 9a3 3 0 110 6 3 3 0 010-6z",
    "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  ],
};

function StepIcon({ icon }: { icon: WorkflowStep["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mb-4 size-7 text-green"
    >
      {ICON_PATHS[icon].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default function WorkflowSection() {
  return (
    <section id="workflow" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <SectionHeader
        path="./workflow"
        subtitle="cómo trabajo"
        badge={<span className="text-phosphor">{WORKFLOW.length} STEPS</span>}
      />

      <ol className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 min-[760px]:grid-cols-3 min-[1100px]:grid-cols-5">
        {WORKFLOW.map((step, i) => (
          <li key={step.id} className="relative flex">
            <article className="relative flex w-full flex-col rounded border border-border bg-bg-elev p-5 transition-colors hover:border-green">
              <span className="opacity-60">
                <CornerBrackets size="size-2.5" glow={false} corners={["tl", "br"]} />
              </span>

              <p
                aria-hidden
                className="mb-5 font-mono text-5xl leading-none font-extrabold text-phosphor [text-shadow:0_0_20px_color-mix(in_srgb,var(--phosphor)_30%,transparent)]"
              >
                {step.num}
              </p>
              <StepIcon icon={step.icon} />
              <h3 className="mb-2.5 font-mono text-sm tracking-wider text-green uppercase">
                <span className="sr-only">Paso {step.num}: </span>
                {step.title}
              </h3>
              <p className="font-sans text-sm leading-relaxed text-text-mid">{step.description}</p>

              <p className="mt-auto pt-4">
                <span className="block border-t border-dashed border-border pt-3 font-mono text-[10px] tracking-wider text-text-mute">
                  {step.optional && (
                    <span className="mr-2 rounded border border-warn/40 px-1.5 py-0.5 text-xs text-warn">
                      OPCIONAL
                    </span>
                  )}
                  {step.meta}
                </span>
              </p>
            </article>

            {/* Connector arrow, centered in the gap — only in the 5-column row */}
            {i < WORKFLOW.length - 1 && (
              <span
                aria-hidden
                className="pointer-events-none absolute top-5 -right-2 hidden h-12 translate-x-1/2 items-center font-mono text-xl text-border-strong min-[1100px]:flex"
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid grid-cols-1 items-center gap-4 rounded border border-dashed border-border-strong bg-bg-elev p-5 md:grid-cols-[auto_1fr_auto]">
        <span className="font-mono text-sm text-green">
          <span className="text-text-mute">$ </span>cotizar_proyecto
        </span>
        <p className="font-sans text-sm text-text-mid">
          ¿Tenés algo en mente? Pedime un presupuesto con alcance y plazo estimado.
        </p>
        <a
          href={`mailto:${EMAIL}`}
          className="justify-self-start rounded border border-green px-3.5 py-2 font-mono text-sm text-green transition-colors hover:bg-green hover:text-bg md:justify-self-auto"
        >
          EMAIL →
        </a>
      </div>
    </section>
  );
}
