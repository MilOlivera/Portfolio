import type { ReactNode } from "react";
import { EMAIL, GITHUB, LINKEDIN } from "@/lib/site";
import CornerBrackets from "./CornerBrackets";
import SectionHeader from "./SectionHeader";

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const MailIcon = () => (
  <svg {...ICON_PROPS}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
);

const LinkedInIcon = () => (
  <svg {...ICON_PROPS}>
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <path d="M7 10v7M7 7v.01M11 17v-7M11 13.5a3 3 0 0 1 6 0V17" />
  </svg>
);

const GitHubIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

function CtaLink({
  href,
  icon,
  children,
  primary = false,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  primary?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`inline-flex items-center gap-2 border px-5 py-3 font-mono text-sm font-semibold tracking-wider transition-colors ${
        primary
          ? "border-green bg-green text-bg hover:border-phosphor hover:bg-phosphor"
          : "border-border-strong text-text hover:border-green hover:text-green"
      }`}
    >
      {icon}
      {children}
    </a>
  );
}

export default function CTA() {
  return (
    <section id="contact" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
      <SectionHeader path="./contact" badge={<span className="text-phosphor">OPEN TO WORK</span>} />

      <div className="relative rounded border border-border-strong bg-bg-elev p-6 sm:p-10">
        <CornerBrackets size="size-4" corners={["tl", "br"]} />

        <p className="font-mono text-sm text-green">$ initiate_contact</p>
        <h3 className="mt-4 font-mono text-2xl font-semibold text-text md:text-3xl">¿Armamos algo juntos?</h3>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-text-mid">
          Trabajo freelance con equipos de producto que buscan pasar de prototipo a producción, o con
          empresas que necesitan automatizar operación con IA.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <CtaLink href={`mailto:${EMAIL}`} icon={<MailIcon />} primary>
            EMAIL
          </CtaLink>
          <CtaLink href={`https://${LINKEDIN}`} icon={<LinkedInIcon />}>
            LINKEDIN
          </CtaLink>
          <CtaLink href={`https://${GITHUB}`} icon={<GitHubIcon />}>
            GITHUB
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
