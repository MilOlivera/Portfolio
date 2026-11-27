// Catalog for the al-través carousel: what each project buoy / Zona Común ship
// shows. Pure data. Real screenshots go in /public/3d/projects/<id>/ — set a
// slide's `imagePath` and it replaces the placeholder gradient.
import { EMAIL } from "@/lib/site";

export type SlidePlaceholder = "green" | "purple" | "amber" | "blue";

export type ProjectMedia = {
  id: string;
  name: string;
  subtitle: string;
  isPublic: boolean;
  url?: string; // public projects → VER PROYECTO
  demoEmail?: string; // confidential projects → SOLICITAR DEMO
  slides: { title: string; imagePath?: string; placeholder?: SlidePlaceholder }[];
};

export const PROJECT_MEDIA: Record<string, ProjectMedia> = {
  "mi-plata": {
    id: "mi-plata",
    name: "Mi Plata",
    subtitle: "dashboard multi-moneda · ARS + USD blue/oficial/MEP/cripto/tarjeta · gastos, metas, ahorro dolarizado",
    isPublic: true,
    url: "https://mi-plata-navy.vercel.app",
    // Real screenshots of the app, loaded with mock data (badge on each slide)
    slides: [
      { title: "RESUMEN", imagePath: "/3d/projects/mi-plata/mi-plata-01-resumen.png" },
      { title: "MOVIMIENTOS", imagePath: "/3d/projects/mi-plata/mi-plata-02-movimientos.png" },
      { title: "AHORRO DOLARIZADO", imagePath: "/3d/projects/mi-plata/mi-plata-03-ahorro.png" },
      { title: "METAS & BIENES", imagePath: "/3d/projects/mi-plata/mi-plata-04-metas.png" },
    ],
  },
  relojes: {
    id: "relojes",
    name: "E-commerce Relojes",
    subtitle: "primer proyecto full-stack · en reconstrucción con Mercado Pago sandbox",
    isPublic: false,
    demoEmail: EMAIL,
    slides: [
      { title: "HERO", imagePath: "/3d/projects/relojes/01-hero.png" },
      { title: "ILUMINACIÓN TRITIO", imagePath: "/3d/projects/relojes/02-tritio.png" },
      { title: "LATEST COLLECTION", imagePath: "/3d/projects/relojes/04-collection.png" },
      { title: "FEATURES", imagePath: "/3d/projects/relojes/05-features.png" },
    ],
  },
  evolvere: {
    id: "evolvere",
    name: "Evolvere Training Lab",
    subtitle: "landing + plataforma + dashboard + app mobile · gimnasio de biomecánica",
    isPublic: true,
    url: "https://evolverelab.com",
    slides: [
      { title: "LANDING", imagePath: "/3d/projects/evolvere/landing/01-hero.png" },
      { title: "TESTIMONIOS", imagePath: "/3d/projects/evolvere/landing/02-testimonios.png" },
      { title: "PLATAFORMA · INICIO", imagePath: "/3d/projects/evolvere/plataforma/01-inicio.png" },
      { title: "PLATAFORMA · CALENDARIO", imagePath: "/3d/projects/evolvere/plataforma/02-calendario.png" },
      { title: "DASHBOARD · VENTAS", imagePath: "/3d/projects/evolvere/dashboard/02-ventas.png" },
      { title: "DASHBOARD · CLOSING", imagePath: "/3d/projects/evolvere/dashboard/04-closing.png" },
      { title: "APP DESKTOP · INICIO", imagePath: "/3d/projects/evolvere/app-desktop/01-inicio.png" },
      { title: "APP DESKTOP · PROGRESO", imagePath: "/3d/projects/evolvere/app-desktop/07-progreso.png" },
      { title: "APP MOBILE · HOME", imagePath: "/3d/projects/evolvere/app-mobile/01-home.png" },
      { title: "APP MOBILE · COMPARATIVA", imagePath: "/3d/projects/evolvere/app-mobile/05-comparativa.png" },
    ],
  },
  ospatrones: {
    id: "ospatrones",
    name: "OSPatrones · Landing + BI",
    subtitle: "landing institucional + reemplazo de Power BI sobre SiSalud (gerencial)",
    isPublic: false,
    demoEmail: EMAIL,
    slides: [
      { title: "LANDING · HERO", imagePath: "/3d/projects/ospatrones/landing/01-hero.png" },
      { title: "LANDING · APP MOBILE", imagePath: "/3d/projects/ospatrones/landing/02-app-mobile.png" },
      { title: "LANDING · BENEFICIOS", imagePath: "/3d/projects/ospatrones/landing/03-beneficios.png" },
      { title: "LANDING · ATENCIÓN ONLINE", imagePath: "/3d/projects/ospatrones/landing/04-atencion.png" },
      { title: "LANDING · FOOTER", imagePath: "/3d/projects/ospatrones/landing/05-footer.png" },
      { title: "BI GERENCIAL", placeholder: "blue" },
    ],
  },
  marpla: {
    id: "marpla",
    name: "Marpla · Dashboards operativos",
    subtitle: "dashboard de ingresos/gastos/operación + control de stock · PyME pastry",
    isPublic: false,
    demoEmail: EMAIL,
    slides: [
      { title: "DASHBOARD · INICIO", imagePath: "/3d/projects/marpla/dashboard/01-inicio.png" },
      { title: "DASHBOARD · INGRESOS", imagePath: "/3d/projects/marpla/dashboard/02-ingresos.png" },
      { title: "DASHBOARD · GASTOS", imagePath: "/3d/projects/marpla/dashboard/03-gastos.png" },
      { title: "DASHBOARD · OPERACIÓN", imagePath: "/3d/projects/marpla/dashboard/04-operacion.png" },
      { title: "STOCK · LISTA", imagePath: "/3d/projects/marpla/stock/01-stock.png" },
      { title: "STOCK · COMPRAS", imagePath: "/3d/projects/marpla/stock/02-compras.png" },
      { title: "STOCK · MÉTRICAS", imagePath: "/3d/projects/marpla/stock/05-metricas.png" },
    ],
  },
  musacchio: {
    id: "musacchio",
    name: "Estudio Musacchio · Web + Radar",
    subtitle: "landing institucional + radar penal económico (bot + dashboard)",
    isPublic: true,
    url: "https://estudiomusacchio.com",
    slides: [
      { title: "LANDING · HERO", imagePath: "/3d/projects/musacchio/landing/01-hero.png" },
      { title: "LANDING · PERFIL", imagePath: "/3d/projects/musacchio/landing/02-perfil.png" },
      { title: "LANDING · ÁREAS", imagePath: "/3d/projects/musacchio/landing/03-areas.png" },
      { title: "LANDING · ACADEMIA", imagePath: "/3d/projects/musacchio/landing/05-academia.png" },
      { title: "LANDING · AULA ABIERTA", imagePath: "/3d/projects/musacchio/landing/06-aula.png" },
      { title: "RADAR · HECHOS", imagePath: "/3d/projects/musacchio/portal/01-sin-revisar.png" },
      { title: "RADAR · DESCARTADOS", imagePath: "/3d/projects/musacchio/portal/03-descartados.png" },
    ],
  },
};

/** mailto for a confidential project's demo request. */
export function demoMailto(p: ProjectMedia) {
  const subject = encodeURIComponent(`Solicitud de demo: ${p.name}`);
  const body = encodeURIComponent(
    `Hola Milton,\n\nVi "${p.name}" navegando el portfolio 3D y me gustaría ver una demo.\n\nContexto (empresa / rol):\n\nGracias.`,
  );
  return `mailto:${p.demoEmail ?? EMAIL}?subject=${subject}&body=${body}`;
}
