import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CITIES, mapWmoToState, WEATHER_STATES } from "../utils/weatherCodes";

const WeatherContext = createContext(null);

const CACHE_KEY = "portfolio_weather_cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const SELECTED_CITY_KEY = "portfolio_selected_city";

export const WeatherProvider = ({ children }) => {
  const [cityId, setCityId] = useState(() => {
    try {
      return sessionStorage.getItem(SELECTED_CITY_KEY) || "buenos-aires";
    } catch {
      return "buenos-aires";
    }
  });

  const [realWeather, setRealWeather] = useState(null); // datos reales de API
  const [manualState, setManualState] = useState(null); // override manual (o null = modo real)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = CITIES.find((c) => c.id === cityId) || CITIES[0];

  const fetchWeather = useCallback(async (selectedCity) => {
    const cacheKey = `${CACHE_KEY}_${selectedCity.id}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          setRealWeather(parsed.data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    setLoading(true);
    setError(null);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,weather_code,is_day&timezone=${encodeURIComponent(selectedCity.tz)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const current = data.current;

      const weatherData = {
        state: mapWmoToState(current.weather_code, current.is_day === 1),
        temp: Math.round(current.temperature_2m),
        code: current.weather_code,
        isDay: current.is_day === 1,
        city: selectedCity.name,
      };

      setRealWeather(weatherData);

      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ data: weatherData, timestamp: Date.now() })
        );
      } catch {}
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err.message);
      setRealWeather({
        state: WEATHER_STATES.SUNNY,
        temp: 22,
        code: 0,
        isDay: true,
        city: selectedCity.name,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city);
    const interval = setInterval(() => fetchWeather(city), CACHE_TTL);
    return () => clearInterval(interval);
  }, [city, fetchWeather]);

  const changeCity = (newCityId) => {
    setCityId(newCityId);
    try {
      sessionStorage.setItem(SELECTED_CITY_KEY, newCityId);
    } catch {}
  };

  // Override manual: setea el estado a forzar, o null para volver al real
  const setManualWeather = (state) => {
    setManualState(state);
  };

  // El "weather" final que ven los componentes:
  // si hay manualState, devolvemos los datos reales pero con el state forzado
  const weather = realWeather
    ? manualState
      ? { ...realWeather, state: manualState }
      : realWeather
    : null;

  const isManual = manualState !== null;

  const value = {
    weather,
    loading,
    error,
    city,
    cities: CITIES,
    changeCity,
    isManual,
    setManualWeather,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather debe usarse dentro de WeatherProvider");
  }
  return context;
};