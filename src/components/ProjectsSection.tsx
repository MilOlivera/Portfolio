"use client";

import { useState } from "react";
import CornerBrackets from "./CornerBrackets";
import {
  CATEGORY_LABELS,
  PROJECTS,
  requestDemoMailto,
  type Category,
  type Project,
} from "@/lib/projects";

type Filter = Category | "all";

const FILTERS: Filter[] = ["all", ...(Object.keys(CATEGORY_LABELS) as Category[])];

function Badge({ project }: { project: Project }) {
  const base = "shrink-0 rounded-sm border px-2 py-0.5 text-[10px] tracking-widest whitespace-nowrap";
  if (project.status === "rebuilding") {
    return <span className={`${base} border-warn/50 text-warn`}>◐ REBUILDING</span>;
  }
  if (project.visibility === "public") {
    return <span className={`${base} border-green/50 text-green`}>● PUBLIC</span>;
  }
  return <span className={`${base} border-border text-text-mute`}>⬢ CONFIDENTIAL</span>;
}

function Action({ project }: { project: Project }) {
  const base = "font-mono text-xs font-semibold tracking-wider";
  if (project.status === "rebuilding") {
    return (
      <span className={`${base} cursor-not-allowed text-warn opacity-50`} aria-disabled="true">
        REBUILDING →
      </span>
    );
  }
  if (project.visibility === "public" && project.url) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} text-green underline-offset-4 hover:underline`}
        aria-label={`Ver ${project.title} (abre en una pestaña nueva)`}
      >
        VIEW →
      </a>
    );
  }
  return (
    <a
      href={requestDemoMailto(project)}
      className={`${base} text-green underline-offset-4 hover:underline`}
      aria-label={`Solicitar demo de ${project.title} por email`}
    >
      SOLICITAR DEMO →
    </a>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-md border border-border bg-bg-elev p-5 transition-colors hover:border-green">
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-sm leading-snug font-semibold text-text">{project.title}</h3>
        <Badge project={project} />
      </header>

      <p className="mt-3 font-sans text-sm leading-relaxed text-text-mid">{project.blurb}</p>

      <ul className="mt-4 mb-5 flex flex-wrap gap-1.5" aria-label="Tecnologías">
        {project.tags.map((tag) => (
          <li key={tag} className="rounded-sm border border-border px-2 py-0.5 text-xs text-text-mute">
            {tag}
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-xs tracking-widest text-phosphor uppercase">
          {CATEGORY_LABELS[project.category]}
        </span>
        <Action project={project} />
      </footer>
    </article>
  );
}

export default function ProjectsSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <section id="projects" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      {/* Header */}
      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-4 py-4">
        <CornerBrackets />
        <h2 className="font-mono text-lg font-bold text-text sm:text-xl">
          <span className="text-green">./projects</span>
          <span className="text-text-mute"> — {PROJECTS.length} productos en producción</span>
        </h2>
        <p role="status" className="font-mono text-[11px] tracking-widest text-text-mute">
          SHOWING <span className="text-green">{visible.length}</span>/{PROJECTS.length}
        </p>
      </div>

      {/* Filters: horizontal scroll stays inside this bar */}
      <div className="scrollbar-hide -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div role="group" aria-label="Filtrar proyectos por categoría" className="flex w-max gap-2">
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={`rounded-sm border px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors ${
                  active
                    ? "border-green bg-green/10 text-green"
                    : "border-border-strong bg-bg-elev text-text-mute hover:border-green hover:text-text"
                }`}
              >
                {f === "all" ? "all" : CATEGORY_LABELS[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
