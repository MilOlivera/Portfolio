import { PROJECTS, findProject, requestDemoMailto, type Project } from "./projects";
import { EMAIL, GITHUB, LINKEDIN } from "./site";
import type { Theme } from "./theme";

/* ─────────────────────────────────────────────────────────────
   Output model
   Commands return lines of typed segments (not HTML strings) so
   React escapes everything, including echoed user input.
   Style keys: k = green keyword · d = muted comment · w = warn
   p = path · undefined = plain text
   ───────────────────────────────────────────────────────────── */
export type Style = "k" | "d" | "w" | "p";
export type Segment = { text: string; style?: Style; href?: string };
export type Line = Segment[];

export type CommandContext = {
  theme: Theme;
  history: string[]; // includes the command being run
};

export type CommandResult =
  | { type: "output"; lines: Line[]; setTheme?: Theme }
  | { type: "CLEAR" };

const k = (text: string): Segment => ({ text, style: "k" });
const d = (text: string): Segment => ({ text, style: "d" });
const w = (text: string): Segment => ({ text, style: "w" });
const p = (text: string): Segment => ({ text, style: "p" });
const t = (text: string): Segment => ({ text });
const a = (text: string, href: string): Segment => ({ text, style: "k", href });

/** Plain lines; a line starting with "//" is rendered as a comment. */
function text(...rows: string[]): Line[] {
  return rows.map((r) => [r.startsWith("//") ? d(r) : t(r)]);
}

const out = (lines: Line[], setTheme?: Theme): CommandResult => ({ type: "output", lines, setTheme });

/* ─── Static data ─────────────────────────────────────────── */

const HELP: [string, string][] = [
  ["help", "show this message"],
  ["whoami", "short bio"],
  ["ls", "list all projects (alias de projects)"],
  ["projects", "list all projects"],
  ["cat about", "long form about"],
  ["cat recruiters", "pitch for recruiters"],
  ["cat clients", "pitch for freelance clients"],
  ["cat cv.txt", "short cv dump"],
  ["cat <project>", "project details (names from ls)"],
  ["stack", "technical stack"],
  ["socials", "contact links"],
  ["contact", "alias de socials"],
  ["theme", "show current theme"],
  ["theme green", "switch to green Evolvere"],
  ["theme amber", "switch to amber CRT"],
  ["clear", "clear terminal"],
  ["history", "show command history"],
  ["sudo hire-me", "the fun one"],
];

const STACK: [string, string][] = [
  ["frontend:", "React · Next.js 16 · TypeScript · Tailwind · Expo · R3F"],
  ["backend: ", "Node · Prisma · PostgreSQL · Python · FastAPI"],
  ["ai/data: ", "Claude API · OpenAI · LangChain · pgvector · Pandas"],
  ["infra:   ", "Vercel · Render · Neon · Supabase · GitHub Actions"],
];

const socials = (): Line[] => [
  [k("email:    "), a(EMAIL, `mailto:${EMAIL}`)],
  [k("linkedin: "), a(LINKEDIN, `https://${LINKEDIN}`)],
  [k("github:   "), a(GITHUB, `https://${GITHUB}`)],
  [k("location: "), t("Adrogué, Buenos Aires, AR")],
];

const NAME_WIDTH = Math.max(...PROJECTS.map((pr) => pr.shortName.length)) + 3;

function projectRow(pr: Project): Line {
  const isPublic = pr.visibility === "public";
  return [
    d(isPublic ? "drwxr-xr-x  " : "drwx------  "),
    p(`${pr.shortName}/`.padEnd(NAME_WIDTH)),
    isPublic ? k("[PUB]") : d("[CONF]"),
    ...(pr.status === "rebuilding" ? [w(" [REBUILDING]")] : []),
  ];
}

const projects = (): Line[] => {
  const pub = PROJECTS.filter((pr) => pr.visibility === "public");
  const conf = PROJECTS.filter((pr) => pr.visibility === "confidential");
  return [
    [t(`total ${PROJECTS.length}`)],
    [d(`// public (${pub.length})`)],
    ...pub.map(projectRow),
    [d(`// confidential (${conf.length})`)],
    ...conf.map(projectRow),
    [t("")],
    [d("// tip: cat <nombre> para ver el detalle — ej. "), k("cat ospatrones-bi")],
  ];
};

function catProject(pr: Project): Line[] {
  const lines: Line[] = [
    [d(`// ${pr.shortName} / README.md`)],
    [k(pr.title)],
    [t("")],
    [t(pr.blurb)],
    [t("")],
    [k("tags:       "), t(pr.tags.join(" · "))],
    [k("category:   "), p(pr.category)],
    [k("visibility: "), pr.visibility === "public" ? k("PUBLIC") : d("CONFIDENTIAL")],
  ];
  if (pr.status === "rebuilding") {
    lines.push([
      w("⚠ STATUS: REBUILDING — primer proyecto full-stack, en reactivación con Mercado Pago sandbox."),
    ]);
  } else if (pr.visibility === "public" && pr.url) {
    lines.push([k("link:       "), a(pr.url.replace(/^https?:\/\//, ""), pr.url)]);
  } else {
    lines.push([w("REQUEST DEMO: "), a(`mailto:${EMAIL}`, requestDemoMailto(pr))]);
  }
  return lines;
}

/* ─── Registry ─────────────────────────────────────────────── */

const COMMANDS: Record<string, (ctx: CommandContext) => CommandResult> = {
  help: () =>
    out([
      [d("// available commands")],
      ...HELP.map(([cmd, desc]): Line => [k(cmd.padEnd(15)), d("— "), t(desc)]),
    ]),

  whoami: () =>
    out([
      [k("milton_olivera"), t(" · full-stack developer · based in Adrogué, AR")],
      [d("// Marino Mercante (9y) + Software Dev (5y)")],
    ]),

  "cat about": () =>
    out(
      text(
        "// milton.olivera / bio.md",
        "",
        "Vengo de navegar ríos como Oficial Fluvial — La Plata,",
        "Canal Emilio Mitre, Paraná de las Palmas, Puerto Campana.",
        "",
        "Hace 5 años pivoteé al software. Hoy combino los dos mundos:",
        "construyo productos con stack moderno pero con la disciplina",
        "operacional que me dejó la marina mercante.",
        "",
        "Co-fundador de Evolvere Training Lab, dueño de Marpla,",
        "en equipo directivo de OSPatrones.",
        "Monotributista — facturo a mi nombre.",
      ),
    ),

  "cat recruiters": () =>
    out(
      text(
        "// cv for recruiters",
        "",
        "Busco sumarme a un equipo donde pueda aportar criterio técnico,",
        "mirada de producto y velocidad de ejecución.",
        "",
        "Interés especial: IA aplicada, data visualization,",
        "productos que resuelvan problemas reales.",
        "",
        "Stack preferido: Next.js 16 · TypeScript · Prisma · PostgreSQL.",
        "Disponible para: remoto, híbrido, Buenos Aires.",
      ),
    ),

  "cat clients": () =>
    out(
      text(
        "// cv for freelance clients",
        "",
        "Tengo tres negocios propios. Cuando construyo software para otros,",
        "pienso como dueño: qué métrica importa,",
        "qué va a romper en 6 meses, cuánto cuesta mantener.",
        "",
        "Entrego productos funcionales en semanas, no en meses.",
        "",
        "Dashboard disperso en Excel? Proceso manual que repiten mil veces?",
        "Agente IA sobre tu data interna? Hablemos.",
      ),
    ),

  "cat cv.txt": () =>
    out([
      [k("NAME:     "), t("Milton Olivera")],
      [k("ROLE:     "), t("Full-Stack Developer")],
      [k("LOC:      "), t("Adrogué, Buenos Aires, AR")],
      [k("EMAIL:    "), a(EMAIL, `mailto:${EMAIL}`)],
      [t("")],
      [w("EXPERIENCE (recent):")],
      ...text(
        "- 2024–now  Co-founder & Dev @ Evolvere Training Lab · Marpla",
        "- 2022–now  Equipo Directivo + Dev @ OSPatrones",
        "- 2022–2024 Coord. Desarrollo @ GCBA · Bienestar Integral",
        "- 2021      Primer Oficial @ Svitzer",
        "- 2020–2021 2° Oficial @ Naviera Cruz del Sur",
        "- 2017–2020 Oficial Fluvial @ Bahía Grande · National Shipping",
      ),
    ]),

  projects: () => out(projects()),
  ls: () => out(projects()),

  stack: () => out(STACK.map(([label, items]): Line => [k(label + " "), t(items)])),

  socials: () => out(socials()),
  contact: () => out(socials()),

  theme: ({ theme }) =>
    out([
      [t("current theme: "), k(theme), d(theme === "green" ? "  (default)" : "  (easter egg)")],
      [t("available: green · amber")],
      [d("// use 'theme green' or 'theme amber' to switch")],
    ]),

  "theme green": () =>
    out([[k("✓ theme switched to green Evolvere")], [d("// #25DB79 · default")]], "green"),

  "theme amber": () =>
    out([[k("✓ theme switched to amber CRT")], [d("// #FFB020 · easter egg para los nostálgicos")]], "amber"),

  clear: () => ({ type: "CLEAR" }),

  history: ({ history }) =>
    out(history.map((cmd, i): Line => [d(String(i + 1).padStart(3) + "  "), t(cmd)])),

  "sudo hire-me": () =>
    out([
      [d("[sudo] password for recruiter: "), t("************")],
      [d("...")],
      [k("Authentication successful ✓")],
      [t("")],
      [t("Great. Let's talk.")],
      [w("→ "), a(EMAIL, `mailto:${EMAIL}`)],
      [w("→ "), a(LINKEDIN, `https://${LINKEDIN}`)],
    ]),
};

/** Normalizes input: trims, collapses spaces, lowercases. */
export function normalize(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const cmd = normalize(input);
  // Own-property check so "constructor", "tostring"... don't hit Object.prototype
  if (Object.hasOwn(COMMANDS, cmd)) return COMMANDS[cmd](ctx);

  // cat <project-id | shortName>
  if (cmd.startsWith("cat ")) {
    const name = cmd.slice(4);
    const project = findProject(name);
    if (project) return out(catProject(project));
    return out([
      [w(`cat: ${name}: No such file or directory`)],
      [d("// try 'ls' to see available projects")],
    ]);
  }

  return out([
    [w("command not found: "), t(input.trim())],
    [d("// type 'help' to see available commands")],
  ]);
}

export const WELCOME: Line[] = [
  [t("Welcome to "), k("milton.olivera"), t(" portfolio v1.0")],
  [d("Last login: Wed Nov 18 2026 from recruiter.local")],
  [t("Type "), k("help"), t(" to see available commands.")],
  [d("// hint: probá 'theme amber' si sos fan del CRT")],
];
