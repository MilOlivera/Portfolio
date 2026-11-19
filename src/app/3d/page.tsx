import type { Metadata } from "next";
import Hud from "./Hud";
import Scene from "./Scene";

export const metadata: Metadata = {
  title: "Render 3D · Milton Olivera",
  description:
    "Navegá el Río de la Plata a bordo de un buque en 3D: el recorrido de Milton Olivera de Oficial Fluvial a Full Stack Developer.",
};

export default function Page3D() {
  return (
    <div className="fixed inset-0 bg-bg">
      <Scene />
      <Hud />
    </div>
  );
}
