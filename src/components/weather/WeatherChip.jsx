import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWeather } from "../../context/WeatherContext";
import {
  WEATHER_EMOJIS,
  WEATHER_LABELS,
  WEATHER_STATES,
} from "../../utils/weatherCodes";
import "./weatherChip.css";

const MANUAL_OPTIONS = [
  WEATHER_STATES.SUNNY,
  WEATHER_STATES.PARTLY_CLOUDY,
  WEATHER_STATES.CLOUDY,
  WEATHER_STATES.RAINY,
  WEATHER_STATES.STORMY,
  WEATHER_STATES.NIGHT,
];

const WeatherChip = () => {
  const { i18n } = useTranslation();
  const {
    weather,
    loading,
    city,
    cities,
    changeCity,
    isManual,
    setManualWeather,
  } = useWeather();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("city"); // 'city' | 'manual'
  const ref = useRef(null);

  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const labels = WEATHER_LABELS[lang];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading || !weather) {
    return (
      <div className="weather-chip weather-chip--loading">
        <span className="weather-chip__dot"></span>
      </div>
    );
  }

  const emoji = WEATHER_EMOJIS[weather.state];
  const label = labels[weather.state];

  return (
    <div className="weather-chip-wrapper" ref={ref}>
      <button
        className={
          isManual
            ? "weather-chip weather-chip--manual"
            : "weather-chip"
        }
        onClick={() => setOpen(!open)}
        aria-label="Weather selector"
        title={isManual ? "Modo manual activo" : "Clima en tiempo real"}
      >
        <span className="weather-chip__emoji">{emoji}</span>
        <span className="weather-chip__text">
          {city.name} · {weather.temp}°
        </span>
        {isManual && <span className="weather-chip__manual-badge">M</span>}
      </button>

      {open && (
        <div className="weather-chip__dropdown">
          {/* Tabs */}
          <div className="weather-chip__tabs">
            <button
              className={
                tab === "city"
                  ? "weather-chip__tab weather-chip__tab--active"
                  : "weather-chip__tab"
              }
              onClick={() => setTab("city")}
            >
              {lang === "es" ? "Ciudad" : "City"}
            </button>
            <button
              className={
                tab === "manual"
                  ? "weather-chip__tab weather-chip__tab--active"
                  : "weather-chip__tab"
              }
              onClick={() => setTab("manual")}
            >
              {lang === "es" ? "Manual" : "Manual"}
            </button>
          </div>

          <div className="weather-chip__divider"></div>

          {tab === "city" && (
            <>
              <div className="weather-chip__current">
                <span className="weather-chip__current-label">{label}</span>
                <span className="weather-chip__current-temp">
                  {weather.temp}°C
                </span>
              </div>
              <div className="weather-chip__divider"></div>
              {cities.map((c) => (
                <button
                  key={c.id}
                  className={
                    c.id === city.id
                      ? "weather-chip__city weather-chip__city--active"
                      : "weather-chip__city"
                  }
                  onClick={() => {
                    changeCity(c.id);
                    setOpen(false);
                  }}
                >
                  {c.name}
                </button>
              ))}
            </>
          )}

          {tab === "manual" && (
            <>
              <div className="weather-chip__manual-info">
                {lang === "es"
                  ? "Forzá el clima de la escena:"
                  : "Force scene weather:"}
              </div>
              <button
                className={
                  !isManual
                    ? "weather-chip__city weather-chip__city--active"
                    : "weather-chip__city"
                }
                onClick={() => setManualWeather(null)}
              >
                <span style={{ marginRight: "0.4rem" }}>🌐</span>
                {lang === "es" ? "Modo real (API)" : "Real mode (API)"}
              </button>
              <div className="weather-chip__divider"></div>
              {MANUAL_OPTIONS.map((state) => (
                <button
                  key={state}
                  className={
                    isManual && weather.state === state
                      ? "weather-chip__city weather-chip__city--active"
                      : "weather-chip__city"
                  }
                  onClick={() => setManualWeather(state)}
                >
                  <span style={{ marginRight: "0.4rem" }}>
                    {WEATHER_EMOJIS[state]}
                  </span>
                  {labels[state]}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherChip;