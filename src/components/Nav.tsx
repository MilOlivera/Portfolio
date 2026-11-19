import Link from "next/link";

const LINKS = [
  { href: "#terminal", label: "terminal" },
  { href: "#projects", label: "projects" },
  { href: "#stack", label: "stack" },
  { href: "#experience", label: "experience" },
  { href: "#contact", label: "contact" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5 text-sm font-semibold text-text">
          <span className="inline-block size-2 rounded-full bg-green animate-pulse-dot" aria-hidden />
          <span>
            milton<span className="text-green">.olivera</span>
          </span>
        </a>

        <ul className="hidden items-center gap-6 text-xs text-text-mute md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-green">
                <span className="text-text-dim">./</span>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          role="group"
          aria-label="Modo de visualización"
          className="flex items-center border border-border-strong text-[11px] uppercase tracking-widest"
        >
          <span
            aria-current="true"
            className="bg-green-soft px-3 py-1.5 font-semibold text-green"
          >
            CV
          </span>
          <Link
            href="/3d"
            aria-label="Modo 3D"
            className="px-3 py-1.5 text-text-mute transition-colors hover:text-green"
          >
            3D
          </Link>
        </div>
      </nav>
    </header>
  );
}
