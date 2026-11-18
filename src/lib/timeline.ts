export type TimelineTrack = "active" | "dev" | "marine";
export type TimelineEntry = {
  id: string;
  date: string; // "2024–hoy", "2021", etc.
  role: string; // "Co-founder & Developer"
  where: string; // "Evolvere Training Lab · plataforma + app + campus"
  track: TimelineTrack;
  current: boolean; // true = filled node with glow (still ongoing)
  order: number; // sort within each track; higher = higher up
};

export const TIMELINE: TimelineEntry[] = [
  // ACTIVE (negocios/trabajos en curso)
  {
    id: "evolvere",
    date: "2024–hoy",
    role: "Co-founder & Developer",
    where: "Evolvere Training Lab · plataforma + app + campus",
    track: "active",
    current: true,
    order: 100,
  },
  {
    id: "ospatrones-exec",
    date: "2022–hoy",
    role: "Equipo Ejecutivo",
    where: "OSPatrones · landing + BI + generador de cartillas",
    track: "active",
    current: true,
    order: 90,
  },
  {
    id: "marpla",
    date: "2017–hoy",
    role: "Owner",
    where: "Marpla · dashboards de ventas y stock",
    track: "active",
    current: true,
    order: 80,
  },

  // DEV (formación)
  { id: "react-ch", date: "2023", role: "React", where: "CoderHouse", track: "dev", current: false, order: 95 },
  {
    id: "teclab",
    date: "2022–hoy",
    role: "Tecnicatura Superior en Programación",
    where: "Teclab · a un proyecto final de recibirse",
    track: "dev",
    current: true,
    order: 100,
  },
  {
    id: "dh-fs",
    date: "2022",
    role: "Full Stack Developer",
    where: "Digital House",
    track: "dev",
    current: false,
    order: 90,
  },
  { id: "js-ch", date: "2021–22", role: "JavaScript", where: "CoderHouse", track: "dev", current: false, order: 85 },

  // MARINE
  {
    id: "cruzdelsur-relief",
    date: "2025",
    role: "2do Oficial · relief",
    where: "Naviera Cruz del Sur",
    track: "marine",
    current: false,
    order: 100,
  },
  { id: "svitzer", date: "2021", role: "Chief Officer", where: "Svitzer", track: "marine", current: false, order: 90 },
  {
    id: "cruzdelsur",
    date: "2020–21",
    role: "2do Oficial",
    where: "Naviera Cruz del Sur",
    track: "marine",
    current: false,
    order: 80,
  },
  {
    id: "bahia-grande",
    date: "2019–20",
    role: "Tercer Oficial",
    where: "Bahía Grande S.A.",
    track: "marine",
    current: false,
    order: 70,
  },
  {
    id: "nacional-shipping",
    date: "2017–18",
    role: "Oficial Fluvial",
    where: "Nacional Shipping",
    track: "marine",
    current: false,
    order: 60,
  },
  {
    id: "umm",
    date: "2017–22",
    role: "Lic. en Transporte & Logística Operativa",
    where: "Universidad de la Marina Mercante",
    track: "marine",
    current: false,
    order: 55,
  },
  {
    id: "escuela-fluvial",
    date: "2014–17",
    role: "Oficial Fluvial",
    where: "Escuela Nacional Fluvial",
    track: "marine",
    current: false,
    order: 40,
  },
];

export const TRACK_LABEL: Record<TimelineTrack, string> = {
  active: "ACTIVE",
  dev: "DEV",
  marine: "MARINA MERCANTE · 9 años",
};
export const TRACK_ORDER: TimelineTrack[] = ["active", "dev", "marine"];
