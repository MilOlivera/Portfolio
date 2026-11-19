export type WorkflowStep = {
  id: string;
  num: string; // "01", "02", ...
  icon: "coin" | "clock" | "package" | "loop" | "gear";
  title: string; // uppercase, corto
  description: string;
  meta: string; // texto chico abajo del card
  optional?: boolean; // true solo en MANTENIMIENTO (badge ámbar)
};

export const WORKFLOW: WorkflowStep[] = [
  {
    id: "presupuesto",
    num: "01",
    icon: "coin",
    title: "PRESUPUESTO",
    description:
      "Cotizo en USD por módulo o alcance. Sin letra chica ni sorpresas: sabés lo que vale cada etapa antes de arrancar.",
    meta: "USD · POR MÓDULO",
  },
  {
    id: "tracking",
    num: "02",
    icon: "clock",
    title: "TRACKING",
    description:
      "Seguimiento en vivo desde mi app de gestión. Ves horas trabajadas, tareas en curso y avance real cada día.",
    meta: "APP PROPIA · EN VIVO",
  },
  {
    id: "entrega",
    num: "03",
    icon: "package",
    title: "ENTREGA LLAVE EN MANO",
    description:
      "Deploy, documentación y traspaso. Te doy el producto listo para usar, con todos los accesos y el código tuyo.",
    meta: "DEPLOY · DOCS · HANDOVER",
  },
  {
    id: "post-entrega",
    num: "04",
    icon: "loop",
    title: "POST-ENTREGA",
    description:
      "Ventana de ajustes incluida tras el handover. Garantía sobre lo entregado, bugs y refinamientos basados en feedback real de uso.",
    meta: "AJUSTES · GARANTÍA",
  },
  {
    id: "mantenimiento",
    num: "05",
    icon: "gear",
    title: "MANTENIMIENTO",
    description:
      "Soporte mensual, mejoras continuas y monitoreo. Hosting y servicios siempre a tu nombre, nunca al mío.",
    meta: "MENSUAL",
    optional: true,
  },
];
