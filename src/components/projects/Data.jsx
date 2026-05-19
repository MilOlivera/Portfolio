// Placeholders elegantes generados con data URI SVG.
// Cuando tengas screenshots reales (con datos mock), reemplazá los `image` por imports normales.

const placeholder = (label, color1, color2) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${color1}'/>
          <stop offset='100%' stop-color='${color2}'/>
        </linearGradient>
      </defs>
      <rect width='600' height='400' fill='url(#g)'/>
      <text x='50%' y='50%' text-anchor='middle' dominant-baseline='middle'
        font-family='system-ui, sans-serif' font-size='38' font-weight='600' fill='white' letter-spacing='1'>
        ${label}
      </text>
    </svg>`
  )}`;

export const projectsData = [
  {
    id: 1,
    image: placeholder("Evolvere Platform", "#1f1f1f", "#4a4a4a"),
    titleKey: "projects.items.evolverePlatform.title",
    descriptionKey: "projects.items.evolverePlatform.description",
    category: "web",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Supabase"],
    demo: "#",
  },
  {
    id: 2,
    image: placeholder("Evolvere App", "#2d2d2d", "#5a5a5a"),
    titleKey: "projects.items.evolvereApp.title",
    descriptionKey: "projects.items.evolvereApp.description",
    category: "mobile",
    stack: ["Expo", "React Native", "TypeScript"],
    demo: "#",
  },
  {
    id: 3,
    image: placeholder("Marpla Dashboard", "#1a1a1a", "#3d3d3d"),
    titleKey: "projects.items.marplaDashboard.title",
    descriptionKey: "projects.items.marplaDashboard.description",
    category: "data",
    stack: ["Next.js", "Python", "PostgreSQL"],
    demo: "#",
  },
  {
    id: 4,
    image: placeholder("Marpla Stock", "#262626", "#525252"),
    titleKey: "projects.items.marplaStock.title",
    descriptionKey: "projects.items.marplaStock.description",
    category: "web",
    stack: ["Next.js", "Prisma", "PostgreSQL"],
    demo: "#",
  },
  {
    id: 5,
    image: placeholder("Corporate Dashboard", "#1c1c1c", "#454545"),
    titleKey: "projects.items.corporateDashboard.title",
    descriptionKey: "projects.items.corporateDashboard.description",
    category: "data",
    stack: ["React", "Charts", "REST API"],
    demo: "#",
  },
  {
    id: 6,
    image: placeholder("Full-Stack Project", "#2a2a2a", "#555555"),
    titleKey: "projects.items.fullStackProject.title",
    descriptionKey: "projects.items.fullStackProject.description",
    category: "web",
    stack: ["Node.js", "Express", "MongoDB"],
    demo: "#",
  },
];

export const projectsNav = [
  { name: "all", labelKey: "projects.filters.all" },
  { name: "web", labelKey: "projects.filters.web" },
  { name: "mobile", labelKey: "projects.filters.mobile" },
  { name: "data", labelKey: "projects.filters.data" },
];