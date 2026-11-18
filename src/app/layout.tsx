import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import BootSequence from "@/components/BootSequence";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { preHydrationScript } from "@/lib/theme";
import "./globals.css";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://miltonolivera.netlify.app";
const TITLE = "Milton Olivera — Full-Stack Developer & Marino Mercante";
const DESCRIPTION =
  "Full-stack developer (Next.js, React, TypeScript, Python, IA) y Oficial de la Marina Mercante. 12 proyectos en producción: plataformas, apps móviles, dashboards de BI y agentes de IA.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Milton Olivera",
  },
  description: DESCRIPTION,
  applicationName: "Milton Olivera Portfolio",
  authors: [{ name: "Milton Olivera", url: SITE_URL }],
  creator: "Milton Olivera",
  keywords: [
    "Milton Olivera",
    "Full-Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
    "Python",
    "Claude API",
    "Marina Mercante",
    "Buenos Aires",
    "Portfolio",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Milton Olivera",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050607",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${jetbrains.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies saved theme + boot-seen flag before first paint */}
        <script dangerouslySetInnerHTML={{ __html: preHydrationScript }} />
        <noscript>
          <style>{`.boot-overlay{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <BootSequence />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
