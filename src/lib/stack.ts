export type StackCategory = "frontend" | "mobile" | "backend" | "data" | "infra" | "ai";
export type StackItem = { name: string; primary?: boolean };

export const STACK: Record<StackCategory, StackItem[]> = {
  frontend: [
    { name: "Next.js 16", primary: true },
    { name: "React 19", primary: true },
    { name: "TypeScript", primary: true },
    { name: "Tailwind 4" },
  ],
  mobile: [
    { name: "Expo", primary: true },
    { name: "React Native", primary: true },
    { name: "EAS Build" },
    { name: "EAS OTA" },
  ],
  backend: [
    { name: "Node.js", primary: true },
    { name: "Prisma", primary: true },
    { name: "Python" },
    { name: "ReportLab" },
    { name: "next-auth" },
  ],
  data: [
    { name: "PostgreSQL", primary: true },
    { name: "Neon" },
    { name: "SQL Server" },
    { name: "Firebase" },
    { name: "Supabase" },
  ],
  infra: [
    { name: "Netlify" },
    { name: "Vercel" },
    { name: "Render" },
    { name: "IIS / PM2" },
    { name: "Cloudflare" },
  ],
  ai: [
    { name: "Anthropic", primary: true },
    { name: "OpenAI" },
    { name: "Claude Code" },
  ],
};

export const CATEGORY_ORDER: StackCategory[] = ["frontend", "mobile", "backend", "data", "infra", "ai"];
