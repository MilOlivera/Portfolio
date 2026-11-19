"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import CornerBrackets from "@/components/CornerBrackets";

const MOBILE_MAX_WIDTH = 1024;
const REDIRECT_DELAY_MS = 2000;

function isTouchMobile() {
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  return touch && window.innerWidth < MOBILE_MAX_WIDTH;
}

const noopSubscribe = () => () => {};

export default function Hud() {
  const router = useRouter();
  // Read once on the client; server snapshot is "desktop" (no redirect).
  const mobile = useSyncExternalStore(noopSubscribe, isTouchMobile, () => false);

  useEffect(() => {
    if (!mobile) return;
    const t = window.setTimeout(() => router.replace("/"), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [mobile, router]);

  if (mobile) {
    return (
      <div
        role="status"
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/95 px-6 text-center"
      >
        <p className="font-mono text-sm tracking-widest text-green uppercase">
          Modo 3D optimizado para desktop
        </p>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between p-4">
      <Link
        href="/"
        className="pointer-events-auto relative bg-bg/80 p-2 font-mono text-sm text-green backdrop-blur transition-shadow hover:glow-box"
      >
        <CornerBrackets size="size-2" glow={false} />
        &lt; back to cv
      </Link>
      <p className="bg-bg/80 p-2 font-mono text-xs tracking-wider text-text-mute backdrop-blur">
        VESSEL: B/T NANY · SETUP MODE
      </p>
    </div>
  );
}
