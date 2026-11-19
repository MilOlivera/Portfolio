import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

const SITE_URL = "https://miltonolivera.vercel.app";
const TITLE = "Milton Olivera · Full Stack Developer";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Milton Olivera",
  },
  description:
    "9 años navegando ríos como Oficial Fluvial, 5 construyendo software. Full-stack con React, Next.js, TypeScript y PostgreSQL. 12 productos en producción.",
  keywords: ["full stack developer", "next.js", "react", "typescript", "buenos aires", "freelance"],
  authors: [{ name: "Milton Olivera", url: "https://linkedin.com/in/milton-olivera" }],
  creator: "Milton Olivera",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    title: TITLE,
    description: "9 años navegando ríos, 5 construyendo software. 12 productos en producción. Freelance.",
    siteName: "Milton Olivera",
    images: [{ url: "/milton.jpg", width: 340, height: 700, alt: "Milton Olivera" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "9 años navegando ríos, 5 construyendo software. Freelance.",
    images: ["/milton.jpg"],
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
        {/* Applies saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: preHydrationScript }} />
        <noscript>
          <style>{`.boot-overlay{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
