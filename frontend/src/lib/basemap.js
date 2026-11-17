const key = import.meta.env.VITE_CARTO_BASEMAP_KEY?.trim();
const tiles = 'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png';

export const basemapUrl = key ? `${tiles}?key=${encodeURIComponent(key)}` : tiles;
export const basemapAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attribution/">CARTO</a>';
