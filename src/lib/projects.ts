// Single source of truth for projects: used by ProjectsSection and the terminal.
import { EMAIL } from "./site";

export type Category = "landing" | "platform" | "mobile" | "dashboard" | "ecommerce" | "ai";
export type Visibility = "public" | "confidential";
export type Status = "live" | "rebuilding";

export type Project = {
  id: string;
  title: string;
  shortName: string; // short name for the terminal's `ls`
  blurb: string;
  category: Category;
  tags: string[];
  visibility: Visibility;
  status: Status;
  url?: string; // ONLY when visibility=public && status=live
};

export const PROJECTS: Project[] = [
  // PÚBLICOS (5)
  {
    id: "evolvere-landing",
    shortName: "evolvere-landing",
    title: "Evolvere — Landing institucional",
    blurb:
      "Landing del centro de rehabilitación y fitness. React + Firebase (Auth y Firestore), deploy en Netlify. Primera superficie pública de la marca.",
    category: "landing",
    tags: ["React", "Firebase", "Netlify"],
    visibility: "public",
    status: "live",
    url: "https://evolverelab.com",
  },
  {
    id: "ospatrones-landing",
    shortName: "ospatrones-landing",
    title: "OSPatrones — Landing institucional",
    blurb:
      "Sitio institucional de la Obra Social de Patrones de Cabotaje. Next.js 15, backoffice con login por sector (admin / cartillas / novedades), reverse proxy IIS + PM2 sobre Windows Server propio.",
    category: "landing",
    tags: ["Next.js 15", "Tailwind", "IIS/PM2"],
    visibility: "public",
    status: "live",
    url: "https://www.ospatrones.com.ar",
  },
  {
    id: "musacchio-web",
    shortName: "musacchio-web",
    title: "Estudio Musacchio — Web institucional",
    blurb:
      "Web institucional de estudio de abogacía especializado en penal económico. Next.js, deploy en Vercel, dominio propio del estudio.",
    category: "landing",
    tags: ["Next.js", "Vercel"],
    visibility: "public",
    status: "live",
    url: "https://estudiomusacchio.com",
  },
  {
    id: "finanzas",
    shortName: "finanzas-personales",
    title: "Dashboard de finanzas personales",
    blurb:
      "Dashboard multi-moneda (ARS + distintos tipos de USD con cotización por movimiento). Módulos: gastos fijos y variables, ahorro, metas, inversiones, deudas, presupuesto por categoría. Web + Expo integrado.",
    category: "dashboard",
    tags: ["Next.js", "Expo", "Multi-moneda"],
    visibility: "public",
    status: "live",
    url: "https://github.com/MilOlivera", // o reemplazar por demo cuando exista
  },
  {
    id: "relojes",
    shortName: "relojes-ecommerce",
    title: "E-commerce de relojes",
    blurb:
      "Primer proyecto full-stack. E-commerce con carrito, checkout y panel admin. En reactivación con sandbox de Mercado Pago para re-deployarlo.",
    category: "ecommerce",
    tags: ["Next.js", "Mercado Pago", "Stripe"],
    visibility: "public",
    status: "rebuilding",
    // sin url — status rebuilding deshabilita el botón
  },

  // CONFIDENCIALES (7) — SIN url, botón "SOLICITAR DEMO" vía mailto
  {
    id: "evolvere-platform",
    shortName: "evolvere-platform",
    title: "Evolvere — Plataforma web",
    blurb:
      "Plataforma full-stack para gestión del centro: alumnos, coaches, programas REHAB/SPORT, scoring, hábitos, nutrición, calendarios, reportes con IA (Kommodo). Roles granulares, cron diario, security hardening. Next.js, Neon, Supabase, Render.",
    category: "platform",
    tags: ["Next.js", "Prisma", "Neon", "Supabase"],
    visibility: "confidential",
    status: "live",
  },
  {
    id: "evolvere-app",
    shortName: "evolvere-mobile",
    title: "Evolvere — App móvil",
    blurb:
      "App companion para alumnos y coaches. Tracking de hábitos, scoring, agenda, Face ID persistente, Komodo. En producción en App Store e iOS/Google Play. Expo + React Native, EAS OTA, canal UE habilitado.",
    category: "mobile",
    tags: ["Expo", "React Native", "EAS"],
    visibility: "confidential",
    status: "live",
  },
  {
    id: "evolvere-campus",
    shortName: "evolvere-campus",
    title: "Evolvere — Campus & comunidad",
    blurb:
      "Campus tipo Skool con cursos asincrónicos, clases en vivo (Daily.co embebido), comunidad con canales, exámenes y certificados compartibles en LinkedIn. Moderación en dos capas, feed .ics para calendarios externos, auth Google + email. Next.js, Cloudflare Stream.",
    category: "platform",
    tags: ["Next.js", "Daily.co", "Cloudflare Stream"],
    visibility: "confidential",
    status: "live",
  },
  {
    id: "evolvere-dashboard",
    shortName: "evolvere-dashboard",
    title: "Evolvere — Dashboard de datos",
    blurb:
      "Dashboard interno de métricas de negocio sobre Google Sheets (ventas, closers, abandono). Next.js. Candidato a integrarse en el panel owner de la plataforma.",
    category: "dashboard",
    tags: ["Next.js", "Google Sheets API"],
    visibility: "confidential",
    status: "live",
  },
  {
    id: "ospatrones-bi",
    shortName: "ospatrones-bi",
    title: "OSPatrones — Dashboard BI gerencial",
    blurb:
      "Reemplazo de Power BI sobre SiSalud. ~16.500 afiliados, 34 delegaciones, 9 pestañas (ingresos, egresos, prestadores, alto costo, auditoría, padrón, planes, informes). Incluye generador de cartillas, semáforo prestacional y cruzador REFES como features internas. Next.js, SQL Server vía VPN, Python/ReportLab para PDFs.",
    category: "dashboard",
    tags: ["Next.js", "SQL Server", "Python", "ReportLab"],
    visibility: "confidential",
    status: "live",
  },
  {
    id: "marpla-dashboards",
    shortName: "marpla-dashboards",
    title: "Marpla — Dashboards (PyME)",
    blurb:
      "Dashboards para panadería Marpla y 3 locales de Bruno (Adrogué, Banfield, Palermo). Predicción de ventas (lunes, cruce con clima), control de stock con IVA, pestañas Ingresos/Gastos/Operación/ROI, módulo congeladas separado. Next.js + Firebase.",
    category: "dashboard",
    tags: ["Next.js", "Firebase", "Prediction"],
    visibility: "confidential",
    status: "live",
  },
  {
    id: "musacchio-radar",
    shortName: "musacchio-radar",
    title: "Musacchio — Radar penal económico",
    blurb:
      "Bot que monitorea medios y fuentes oficiales, clasifica con IA en 8 categorías de penal económico (societario, patrimonial, tributario, aduanero, cambiario, prófugos/Interpol, generales, federales) y expone los hits en un panel privado. Next.js + Anthropic API, infra 100% en cuentas del estudio.",
    category: "ai",
    tags: ["Next.js", "Anthropic", "Neon"],
    visibility: "confidential",
    status: "live",
  },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  landing: "landing",
  platform: "platform",
  mobile: "mobile",
  dashboard: "dashboard",
  ecommerce: "ecommerce",
  ai: "ai",
};

export function requestDemoMailto(project: Project): string {
  const subject = encodeURIComponent(`Solicitud de demo: ${project.title}`);
  const body = encodeURIComponent(
    `Hola Milton,\n\nMe gustaría ver una demo de "${project.title}".\n\nContexto (empresa / rol):\n\nQué me interesa ver:\n\nGracias.`,
  );
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}

/** Finds a project by id or shortName (so `cat` works with what `ls` prints). */
export function findProject(name: string): Project | undefined {
  const key = name.replace(/\/$/, "");
  return PROJECTS.find((p) => p.id === key || p.shortName === key);
}
