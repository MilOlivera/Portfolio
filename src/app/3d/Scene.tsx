"use client";

import dynamic from "next/dynamic";
import Loading3D from "./loading";

// `ssr: false` is only allowed inside Client Components in Next 16, so this
// wrapper keeps Three.js entirely out of the server render / prerender.
const SceneCanvas = dynamic(() => import("./SceneCanvas"), {
  ssr: false,
  loading: () => <Loading3D />,
});

export default function Scene() {
  return <SceneCanvas />;
}
