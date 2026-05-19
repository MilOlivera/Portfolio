// Códigos WMO (World Meteorological Organization) usados por Open-Meteo
// Documentación: https://open-meteo.com/en/docs (sección weather_variables)

// Mapeo a 6 estados visuales del portfolio
export const WEATHER_STATES = {
  SUNNY: "sunny",
  PARTLY_CLOUDY: "partly_cloudy",
  CLOUDY: "cloudy",
  RAINY: "rainy",
  STORMY: "stormy",
  NIGHT: "night",
};

// Cada estado tiene un emoji para mostrar en el chip
export const WEATHER_EMOJIS = {
  [WEATHER_STATES.SUNNY]: "☀️",
  [WEATHER_STATES.PARTLY_CLOUDY]: "⛅",
  [WEATHER_STATES.CLOUDY]: "☁️",
  [WEATHER_STATES.RAINY]: "🌧️",
  [WEATHER_STATES.STORMY]: "⛈️",
  [WEATHER_STATES.NIGHT]: "🌙",
};

// Mapea código WMO -> estado visual
export function mapWmoToState(code, isDay) {
  // Si es de noche, devolvemos NIGHT salvo que haya tormenta o lluvia fuerte
  if (!isDay) {
    if ([95, 96, 99].includes(code)) return WEATHER_STATES.STORMY;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return WEATHER_STATES.RAINY;
    return WEATHER_STATES.NIGHT;
  }

  // De día
  if ([0].includes(code)) return WEATHER_STATES.SUNNY;
  if ([1, 2].includes(code)) return WEATHER_STATES.PARTLY_CLOUDY;
  if ([3, 45, 48].includes(code)) return WEATHER_STATES.CLOUDY;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return WEATHER_STATES.RAINY;
  if ([95, 96, 99].includes(code)) return WEATHER_STATES.STORMY;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return WEATHER_STATES.CLOUDY; // nieve la tratamos como nublado fuerte

  return WEATHER_STATES.PARTLY_CLOUDY;
}

// Descripción legible del clima por estado e idioma
export const WEATHER_LABELS = {
  es: {
    [WEATHER_STATES.SUNNY]: "Soleado",
    [WEATHER_STATES.PARTLY_CLOUDY]: "Parcialmente nublado",
    [WEATHER_STATES.CLOUDY]: "Nublado",
    [WEATHER_STATES.RAINY]: "Lluvioso",
    [WEATHER_STATES.STORMY]: "Tormenta",
    [WEATHER_STATES.NIGHT]: "Noche",
  },
  en: {
    [WEATHER_STATES.SUNNY]: "Sunny",
    [WEATHER_STATES.PARTLY_CLOUDY]: "Partly cloudy",
    [WEATHER_STATES.CLOUDY]: "Cloudy",
    [WEATHER_STATES.RAINY]: "Rainy",
    [WEATHER_STATES.STORMY]: "Stormy",
    [WEATHER_STATES.NIGHT]: "Night",
  },
};

// Ciudades disponibles con coords precisas
export const CITIES = [
  { id: "buenos-aires", name: "Buenos Aires", lat: -34.6037, lon: -58.3816, tz: "America/Argentina/Buenos_Aires" },
  { id: "new-york", name: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { id: "london", name: "London", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { id: "tokyo", name: "Tokyo", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
  { id: "sydney", name: "Sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
  { id: "madrid", name: "Madrid", lat: 40.4168, lon: -3.7038, tz: "Europe/Madrid" },
];