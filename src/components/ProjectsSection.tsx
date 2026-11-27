"use client";

import Image from "next/image";
import { useState } from "react";
import FilterTabs from "./FilterTabs";
import SectionHeader from "./SectionHeader";
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

function ProjectThumbnail({ project }: { project: Project }) {
  if (!project.heroImage) return null;
  const isMock = project.visibility === "confidential" || project.id === "finanzas";
  return (
    <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-sm border border-border bg-surface">
      <Image
        src={project.heroImage}
        alt={`Preview de ${project.title}`}
        fill
        sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
        className="object-cover object-top"
      />
      {isMock && (
        <span className="pointer-events-none absolute top-2 right-2 rounded-[2px] border border-[#ffb545] bg-white bg-[linear-gradient(rgba(255,181,69,0.15),rgba(255,181,69,0.15))] px-[6px] py-[2px] font-mono text-[9px] font-bold tracking-[1.5px] text-[#7a4a00]">
          DATA MOCK
        </span>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-md border border-border bg-bg-elev p-5 transition-colors hover:border-green">
      <ProjectThumbnail project={project} />

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
      <SectionHeader
        path="./projects"
        subtitle={`${PROJECTS.length} productos en producción`}
        badgeLive
        badge={
          <>
            SHOWING <span className="text-green">{visible.length}</span>/{PROJECTS.length}
          </>
        }
      />

      <FilterTabs
        options={FILTERS}
        value={filter}
        onChange={setFilter}
        label="Filtrar proyectos por categoría"
      />

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
