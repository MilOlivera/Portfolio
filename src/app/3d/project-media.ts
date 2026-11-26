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

const four = (placeholder: SlidePlaceholder, titles: string[]) => titles.map((title) => ({ title, placeholder }));

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
    slides: [{ title: "EN RECONSTRUCCIÓN", placeholder: "amber" }],
  },
  evolvere: {
    id: "evolvere",
    name: "Evolvere Training Lab",
    subtitle: "plataforma + app mobile del gimnasio de biomecánica",
    isPublic: true,
    url: "https://evolverelab.com",
    slides: four("green", ["PLATAFORMA", "APP MOBILE", "BIOMECÁNICA", "SEGUIMIENTO"]),
  },
  ospatrones: {
    id: "ospatrones",
    name: "OSPatrones · Dashboard BI",
    subtitle: "reemplazo de Power BI sobre SiSalud · gerencial",
    isPublic: false,
    demoEmail: EMAIL,
    slides: four("blue", ["TABLERO GERENCIAL", "PRESTACIONES", "AFILIADOS", "INDICADORES"]),
  },
  marpla: {
    id: "marpla",
    name: "Marpla · Dashboards operativos",
    subtitle: "predicción de stock · 3 locales · pastry business",
    isPublic: false,
    demoEmail: EMAIL,
    slides: four("amber", ["VENTAS POR LOCAL", "PREDICCIÓN DE STOCK", "PRODUCCIÓN", "REPORTES"]),
  },
  musacchio: {
    id: "musacchio",
    name: "Estudio Musacchio · Radar penal",
    subtitle: "monitoreo de noticias judiciales · bot + dashboard",
    isPublic: false,
    demoEmail: EMAIL,
    slides: four("purple", ["RADAR DE NOTICIAS", "ALERTAS DEL BOT", "CAUSAS SEGUIDAS", "DASHBOARD"]),
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
