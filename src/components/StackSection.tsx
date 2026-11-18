import { CATEGORY_ORDER, STACK } from "@/lib/stack";
import SectionHeader from "./SectionHeader";

export default function StackSection() {
  return (
    <section id="stack" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <SectionHeader path="./stack" subtitle="tech stack" badge={`${CATEGORY_ORDER.length} CATEGORIES`} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_ORDER.map((cat) => (
          <article
            key={cat}
            className="rounded border border-border bg-bg-elev p-5 transition-colors hover:border-green"
          >
            <h3 className="mb-4 font-mono text-xs tracking-widest text-phosphor uppercase">./{cat}</h3>
            <ul className="flex flex-wrap gap-2">
              {STACK[cat].map((item) => (
                <li
                  key={item.name}
                  className={`border px-2.5 py-1 font-mono text-xs ${
                    item.primary ? "border-green/40 text-green" : "border-border-strong text-text-mid"
                  }`}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
