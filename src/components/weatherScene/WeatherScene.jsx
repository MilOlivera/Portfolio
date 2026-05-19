import { useEffect, useRef } from "react";
import { useWeather } from "../../context/WeatherContext";
import { WEATHER_STATES } from "../../utils/weatherCodes";
import "./weatherScene.css";

const WeatherScene = () => {
  const { weather } = useWeather();
  const rainRef = useRef(null);
  const lightningRef = useRef(null);
  const lightningIntervalRef = useRef(null);

  // Generar gotas de lluvia según intensidad
  useEffect(() => {
    if (!rainRef.current) return;
    const layer = rainRef.current;
    layer.innerHTML = "";

    if (!weather) return;

    let drops = 0;
    if (weather.state === WEATHER_STATES.RAINY) drops = 60;
    if (weather.state === WEATHER_STATES.STORMY) drops = 120;

    for (let i = 0; i < drops; i++) {
      const drop = document.createElement("div");
      drop.className = "ws__raindrop";
      drop.style.left = Math.random() * 100 + "vw";
      drop.style.height = 15 + Math.random() * 20 + "px";
      drop.style.animationDuration = 0.5 + Math.random() * 0.8 + "s";
      drop.style.animationDelay = Math.random() * 2 + "s";
      layer.appendChild(drop);
    }
  }, [weather]);

  // Manejo de rayos para tormenta
  useEffect(() => {
    if (lightningIntervalRef.current) {
      clearInterval(lightningIntervalRef.current);
      lightningIntervalRef.current = null;
    }

    if (weather?.state === WEATHER_STATES.STORMY && lightningRef.current) {
      lightningIntervalRef.current = setInterval(() => {
        if (Math.random() > 0.5 && lightningRef.current) {
          lightningRef.current.classList.remove("ws__lightning--flash");
          // Trigger reflow para reiniciar animación
          void lightningRef.current.offsetWidth;
          lightningRef.current.classList.add("ws__lightning--flash");
        }
      }, 4000);
    }

    return () => {
      if (lightningIntervalRef.current) {
        clearInterval(lightningIntervalRef.current);
      }
    };
  }, [weather?.state]);

  if (!weather) return null;

  const state = weather.state;

  return (
    <div className="ws__container" aria-hidden="true">
      {/* Cielo según estado */}
      <div
        className={`ws__sky ws__sky--${state}`}
      ></div>

      {/* Nubes flotantes para nublado/parcialmente nublado */}
      {(state === WEATHER_STATES.CLOUDY ||
        state === WEATHER_STATES.PARTLY_CLOUDY) && (
        <div className="ws__clouds">
          <div className="ws__cloud ws__cloud--1"></div>
          <div className="ws__cloud ws__cloud--2"></div>
          <div className="ws__cloud ws__cloud--3"></div>
        </div>
      )}

      {/* Sol para soleado y parcialmente nublado de día */}
      {(state === WEATHER_STATES.SUNNY ||
        state === WEATHER_STATES.PARTLY_CLOUDY) && (
        <div className="ws__sun"></div>
      )}

      {/* Luna y estrellas para noche */}
      {state === WEATHER_STATES.NIGHT && (
        <>
          <div className="ws__moon"></div>
          <div className="ws__stars">
            {Array.from({ length: 30 }).map((_, i) => (
              <span
                key={i}
                className="ws__star"
                style={{
                  left: Math.random() * 100 + "vw",
                  top: Math.random() * 60 + "vh",
                  animationDelay: Math.random() * 3 + "s",
                }}
              ></span>
            ))}
          </div>
        </>
      )}

      {/* Capa de lluvia */}
      <div className="ws__rain" ref={rainRef}></div>

      {/* Capa de tormenta (oscurece) */}
      {state === WEATHER_STATES.STORMY && (
        <div className="ws__storm-overlay"></div>
      )}

      {/* Flash de rayos */}
      <div className="ws__lightning" ref={lightningRef}></div>
    </div>
  );
};

export default WeatherScene;