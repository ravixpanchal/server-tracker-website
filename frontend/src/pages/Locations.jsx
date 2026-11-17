import { basemapUrl, basemapAttribution } from '../lib/basemap';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { serversAPI } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultLocations = [
  { id: 1, name: 'DB-SERVER-01', location_name: 'Server Room A - Delhi', lat: 28.5562, lng: 77.1000, status: 'active', ip: '192.168.1.10' },
  { id: 2, name: 'APP-SERVER-03', location_name: 'Terminal Building - Mumbai', lat: 19.0896, lng: 72.8656, status: 'warning', ip: '192.168.1.21' },
  { id: 3, name: 'CCTV-SERVER-02', location_name: 'Security Control Room - Kolkata', lat: 22.6547, lng: 88.4467, status: 'down', ip: '192.168.1.45' },
  { id: 4, name: 'AUTH-SERVER-01', location_name: 'Data Center B - Chennai', lat: 12.9941, lng: 80.1709, status: 'active', ip: '192.168.1.14' },
  { id: 5, name: 'CACHE-NODE-02', location_name: 'NOC Hub - Bengaluru', lat: 13.1986, lng: 77.7066, status: 'active', ip: '192.168.1.30' },
];

export default function Locations() {
  const [locations, setLocations] = useState(defaultLocations);

  useEffect(() => {
    serversAPI.list()
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : res.data?.servers;
        if (list && list.length > 0) {
          setLocations(list.map((s, i) => ({
            id: s.id || i,
            name: s.name,
            location_name: s.location_name || 'NOC Station',
            lat: s.latitude || defaultLocations[i % defaultLocations.length].lat,
            lng: s.longitude || defaultLocations[i % defaultLocations.length].lng,
            status: s.status || 'active',
            ip: s.ip_address || '192.168.1.1'
          })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-primary-600">Infrastructure Locations</h2>
        <p className="text-sm text-[var(--text-secondary)]">Geographic distribution and regional data centers monitoring across 6 locations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-3 sm:p-4 overflow-hidden border border-[var(--border-color)]" style={{ height: 'clamp(300px, 50vw, 500px)' }}>
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            className="w-full h-full rounded-xl"
          >
            <TileLayer
              attribution={basemapAttribution}
              url={basemapUrl}
            />
            {locations.map((loc) => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div className="font-mono text-xs p-1">
                    <p className="break-all font-bold text-primary-600">{loc.name}</p>
                    <p className="text-[var(--text-secondary)]">{loc.location_name}</p>
                    <p className="text-[var(--text-secondary)]">IP: {loc.ip}</p>
                    <span className={`inline-block mt-1 font-bold text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      loc.status === 'down' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                    }`}>
                      {loc.status}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Location List */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-[var(--border-color)] space-y-4 overflow-y-auto max-h-[350px] lg:max-h-[500px]">
          <h3 className="text-sm font-semibold text-primary-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">distance</span> Registered Stations
          </h3>

          <div className="space-y-3">
            {locations.map((loc) => (
              <div key={loc.id} className="p-3 bg-[var(--bg-tint)] rounded-xl border border-[var(--border-color)] hover:border-indigo-500/50 transition-all font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="break-all font-bold text-primary-600">{loc.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    loc.status === 'down' ? 'bg-rose-50 text-rose-700 border border-rose-500/30' :
                    loc.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                  }`}>
                    {loc.status}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)] font-sans text-xs mb-1">{loc.location_name}</p>
                <p className="text-primary-600 text-[11px]">IP: {loc.ip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
