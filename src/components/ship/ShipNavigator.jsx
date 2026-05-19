import { useEffect, useRef, useState } from "react";
import { useWeather } from "../../context/WeatherContext";
import { WEATHER_STATES } from "../../utils/weatherCodes";
import "./shipNavigator.css";

// 1 = barco recorre todo el path en todo el scroll
// 0.5 = barco recorre solo la mitad del path (más lento, más perceptible)
// 0.3 = aún más lento
const SPEED_FACTOR = 1;

// Margen horizontal del path en píxeles (cuán cerca de los bordes va el barco)
const HORIZONTAL_MARGIN = 80;

// Cantidad de "ondas" (curvas sinusoidales) en todo el documento
const WAVES = 8;

const ShipNavigator = () => {
  const { weather } = useWeather();
  const shipRef = useRef(null);
  const pathRef = useRef(null);
  const svgRef = useRef(null);
  const rafRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const getRockingClass = () => {
    if (!weather) return "ship-navigator__ship--calm";
    switch (weather.state) {
      case WEATHER_STATES.STORMY:
        return "ship-navigator__ship--violent";
      case WEATHER_STATES.RAINY:
        return "ship-navigator__ship--strong";
      case WEATHER_STATES.CLOUDY:
        return "ship-navigator__ship--medium";
      case WEATHER_STATES.PARTLY_CLOUDY:
        return "ship-navigator__ship--soft";
      default:
        return "ship-navigator__ship--calm";
    }
  };

  // Generar el path sinusoidal basado en dimensiones reales
  const generatePathD = (width, height) => {
    if (width === 0 || height === 0) return "";

    const leftX = HORIZONTAL_MARGIN;
    const rightX = width - HORIZONTAL_MARGIN;
    const centerX = width / 2;
    const sectionHeight = height / WAVES;

    let d = `M ${leftX} ${sectionHeight * 0.2}`;
    for (let i = 0; i < WAVES; i++) {
      const y1 = sectionHeight * (i + 0.5);
      const y2 = sectionHeight * (i + 1);
      // Alternamos lado: par va a derecha, impar va a izquierda
      const targetX = i % 2 === 0 ? rightX : leftX;
      d += ` Q ${centerX} ${y1} ${targetX} ${y2}`;
    }
    return d;
  };

  // Actualizar dimensiones cuando cambia el tamaño del documento
  useEffect(() => {
    const updateDimensions = () => {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.scrollHeight;
      setDimensions({ width, height });
    };

    updateDimensions();

    // Observador para cuando cambia la altura del documento (carga de imágenes, etc)
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(document.body);
    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Update del barco atado al scroll
  useEffect(() => {
    const ship = shipRef.current;
    const path = pathRef.current;
    if (!ship || !path || dimensions.height === 0) return;

    const pathLength = path.getTotalLength();
    if (pathLength === 0) return;

    const update = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      const scrollProgress = Math.max(
        0,
        Math.min(1, scrollY / Math.max(1, docHeight))
      );

      // SPEED_FACTOR: si es 0.5, el barco recorre solo media ruta cuando llegás al final
      const pathProgress = Math.min(1, scrollProgress * SPEED_FACTOR);

      const point = path.getPointAtLength(pathLength * pathProgress);
      const nextPoint = path.getPointAtLength(
        Math.min(pathLength, pathLength * pathProgress + 10)
      );

      // Como el SVG ahora usa dimensiones reales, point.x y point.y ya están en px
      const angle = (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180) / Math.PI;

      ship.style.transform = `translate(${point.x - 50}px, ${point.y - 27}px) rotate(${angle}deg)`;
    };

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dimensions]);

  const pathD = generatePathD(dimensions.width, dimensions.height);

  return (
    <div className="ship-navigator" aria-hidden="true">
      <svg
        ref={svgRef}
        className="ship-navigator__route"
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d={pathD}
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          fill="none"
          opacity="0.3"
        />
      </svg>

      {/* DECORACIONES NÁUTICAS */}
      <div className="ship-navigator__decor" style={{ top: "10%", right: "5%" }}>
        <svg width="22" height="34" viewBox="0 0 22 34" className="ship-navigator__bob">
          <ellipse cx="11" cy="23" rx="10" ry="8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8"/>
          <rect x="10" y="9" width="2" height="14" fill="#5f1212"/>
          <circle cx="11" cy="6" r="3" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.5"/>
          <ellipse cx="11" cy="32" rx="12" ry="2" fill="#1e40af" opacity="0.2"/>
        </svg>
      </div>

      <div className="ship-navigator__decor ship-navigator__seagull" style={{ top: "6%", left: "20%" }}>
        <svg width="32" height="14" viewBox="0 0 32 14">
          <path d="M 2 9 Q 9 2 16 9 Q 23 2 30 9" stroke="#1f2937" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "20%", right: "3%" }}>
        <svg width="65" height="36" viewBox="0 0 65 36">
          <path d="M 5 24 L 12 14 L 54 14 L 60 20 L 60 24 Z" fill="#6b7280" stroke="#374151" strokeWidth="0.6"/>
          <rect x="20" y="5" width="20" height="9" fill="#e5e7eb" stroke="#374151" strokeWidth="0.4"/>
          <rect x="24" y="8" width="3" height="3" fill="#1e293b"/>
          <rect x="32" y="8" width="3" height="3" fill="#1e293b"/>
          <line x1="30" y1="0" x2="30" y2="5" stroke="#374151" strokeWidth="0.6"/>
          <rect x="29" y="1" width="6" height="3" fill="#dc2626"/>
          <ellipse cx="32" cy="28" rx="30" ry="2" fill="#1e40af" opacity="0.15"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "30%", left: "5%" }}>
        <svg width="22" height="34" viewBox="0 0 22 34" className="ship-navigator__bob">
          <polygon points="11,10 20,27 2,27" fill="#16a34a" stroke="#14532d" strokeWidth="0.8"/>
          <rect x="10" y="4" width="2" height="6" fill="#14532d"/>
          <circle cx="11" cy="3" r="2" fill="#16a34a" stroke="#14532d" strokeWidth="0.5"/>
          <ellipse cx="11" cy="31" rx="12" ry="2" fill="#1e40af" opacity="0.2"/>
        </svg>
      </div>

      <div className="ship-navigator__decor ship-navigator__seagull" style={{ top: "38%", right: "25%", animationDelay: "-2s" }}>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <path d="M 2 8 Q 7 2 13 8 Q 19 2 24 8" stroke="#1f2937" strokeWidth="0.9" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "46%", left: "4%" }}>
        <svg width="120" height="60" viewBox="0 0 120 60">
          <ellipse cx="60" cy="50" rx="55" ry="9" fill="#d4a574" stroke="#8b6332" strokeWidth="0.6"/>
          <path d="M 25 50 Q 40 28 55 38 Q 70 22 85 40 Q 95 30 100 50 Z" fill="#16a34a" stroke="#14532d" strokeWidth="0.5"/>
          <path d="M 60 38 L 58 22 L 62 22 Z" fill="#854d0e"/>
          <ellipse cx="60" cy="22" rx="5" ry="4" fill="#16a34a"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "55%", right: "6%" }}>
        <svg width="22" height="34" viewBox="0 0 22 34" className="ship-navigator__bob">
          <ellipse cx="11" cy="23" rx="10" ry="8" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8"/>
          <rect x="10" y="9" width="2" height="14" fill="#5f1212"/>
          <ellipse cx="11" cy="32" rx="12" ry="2" fill="#1e40af" opacity="0.2"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "62%", right: "5%" }}>
        <svg width="75" height="32" viewBox="0 0 75 32">
          <path d="M 5 20 L 5 15 L 52 15 L 65 20 L 65 22 L 8 22 Z" fill="#475569" stroke="#1e293b" strokeWidth="0.6"/>
          <rect x="9" y="5" width="6" height="10" fill="#dc2626"/>
          <rect x="16" y="6" width="6" height="9" fill="#16a34a"/>
          <rect x="23" y="5" width="6" height="10" fill="#eab308"/>
          <rect x="30" y="6" width="6" height="9" fill="#3b82f6"/>
          <rect x="40" y="2" width="10" height="13" fill="#e5e7eb" stroke="#1e293b" strokeWidth="0.4"/>
          <ellipse cx="37" cy="25" rx="35" ry="2" fill="#1e40af" opacity="0.15"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "72%", left: "6%" }}>
        <svg width="32" height="40" viewBox="0 0 32 40">
          <circle cx="16" cy="6" r="3.5" fill="none" stroke="#475569" strokeWidth="1.8"/>
          <line x1="16" y1="10" x2="16" y2="30" stroke="#475569" strokeWidth="2"/>
          <line x1="9" y1="15" x2="23" y2="15" stroke="#475569" strokeWidth="1.6"/>
          <path d="M 16 30 Q 4 30 3 21" stroke="#475569" strokeWidth="1.6" fill="none"/>
          <path d="M 16 30 Q 28 30 29 21" stroke="#475569" strokeWidth="1.6" fill="none"/>
        </svg>
      </div>

      <div className="ship-navigator__decor" style={{ top: "82%", right: "8%" }}>
        <svg width="22" height="34" viewBox="0 0 22 34" className="ship-navigator__bob">
          <polygon points="11,10 20,27 2,27" fill="#16a34a" stroke="#14532d" strokeWidth="0.8"/>
          <rect x="10" y="4" width="2" height="6" fill="#14532d"/>
          <ellipse cx="11" cy="31" rx="12" ry="2" fill="#1e40af" opacity="0.2"/>
        </svg>
      </div>

      <div className="ship-navigator__decor ship-navigator__seagull" style={{ top: "88%", left: "30%", animationDelay: "-3s" }}>
        <svg width="28" height="12" viewBox="0 0 28 12">
          <path d="M 2 8 Q 8 2 14 8 Q 20 2 26 8" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round"/>
        </svg>
      </div>

      {/* BUQUE CARGUERO PRINCIPAL */}
      <div ref={shipRef} className={`ship-navigator__ship ${getRockingClass()}`}>
        <svg width="100" height="55" viewBox="0 0 100 55">
          <ellipse cx="50" cy="48" rx="45" ry="3" fill="#1e40af" opacity="0.2"/>
          <path d="M 6 36 L 6 26 L 78 26 L 94 36 L 94 40 L 12 40 Z" fill="#1e3a8a" stroke="#0c1d4d" strokeWidth="0.6"/>
          <line x1="6" y1="33" x2="94" y2="33" stroke="#1e40af" strokeWidth="0.4" opacity="0.6"/>
          <rect x="11" y="20" width="10" height="6" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.3"/>
          <rect x="22" y="20" width="10" height="6" fill="#16a34a" stroke="#14532d" strokeWidth="0.3"/>
          <rect x="33" y="20" width="10" height="6" fill="#eab308" stroke="#854d0e" strokeWidth="0.3"/>
          <rect x="44" y="20" width="10" height="6" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="0.3"/>
          <rect x="55" y="20" width="10" height="6" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.3"/>
          <rect x="14" y="13" width="10" height="6" fill="#a855f7" stroke="#581c87" strokeWidth="0.3"/>
          <rect x="25" y="13" width="10" height="6" fill="#06b6d4" stroke="#155e75" strokeWidth="0.3"/>
          <rect x="36" y="13" width="10" height="6" fill="#f97316" stroke="#7c2d12" strokeWidth="0.3"/>
          <rect x="47" y="13" width="10" height="6" fill="#10b981" stroke="#064e3b" strokeWidth="0.3"/>
          <rect x="20" y="6" width="10" height="6" fill="#ec4899" stroke="#831843" strokeWidth="0.3"/>
          <rect x="31" y="6" width="10" height="6" fill="#84cc16" stroke="#365314" strokeWidth="0.3"/>
          <rect x="68" y="16" width="11" height="10" fill="#f1f5f9" stroke="#0f172a" strokeWidth="0.4"/>
          <rect x="70" y="18" width="2.5" height="2.5" fill="#0f172a"/>
          <rect x="74" y="18" width="2.5" height="2.5" fill="#0f172a"/>
          <rect x="70" y="22" width="2.5" height="2.5" fill="#0f172a"/>
          <rect x="74" y="22" width="2.5" height="2.5" fill="#0f172a"/>
          <rect x="71" y="9" width="5" height="7" fill="#1e3a8a" stroke="#0c1d4d" strokeWidth="0.3"/>
          <rect x="71.5" y="9" width="4" height="2" fill="#dc2626"/>
          <line x1="82" y1="16" x2="82" y2="3" stroke="#0c1d4d" strokeWidth="0.5"/>
          <path d="M 88 36 Q 95 33 100 38" stroke="white" strokeWidth="0.9" fill="none" opacity="0.7"/>
          <path d="M 90 38 Q 95 36 99 39.5" stroke="white" strokeWidth="0.6" fill="none" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
};

export default ShipNavigator;