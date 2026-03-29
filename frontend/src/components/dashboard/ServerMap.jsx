import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  active: '#10B981',
  down: '#EF4444',
  warning: '#F59E0B',
  maintenance: '#8B5CF6',
  disconnected: '#6B7280',
};

const STATUS_LABELS = {
  active: 'Active',
  down: 'Down',
  warning: 'Warning',
  maintenance: 'Maintenance',
  disconnected: 'Disconnected',
};

// India center
const INDIA_CENTER = [22.5, 78.5];
const INITIAL_ZOOM = 5;

function MapLegend() {
  return (
    <div
      className="absolute bottom-4 left-4 z-[1000] glass-card p-3"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
    >
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Status</p>
      <div className="space-y-1">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              {STATUS_LABELS[status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ServerMap({ servers }) {
  if (!servers || servers.length === 0) {
    return (
      <div className="glass-card p-6 h-[400px] flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Loading map data...</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden relative" style={{ height: '420px' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          🗺️ Server Locations — India
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {servers.length} servers tracked
        </span>
      </div>
      <div className="relative" style={{ height: 'calc(100% - 48px)' }}>
        <MapContainer
          center={INDIA_CENTER}
          zoom={INITIAL_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {servers.map((server) => {
            const color = STATUS_COLORS[server.status] || STATUS_COLORS.active;
            const isDown = server.status === 'down';
            return (
              <CircleMarker
                key={server.id}
                center={[server.latitude, server.longitude]}
                radius={isDown ? 10 : 8}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.7,
                  weight: 2,
                  opacity: 1,
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[200px]">
                    <h4 className="font-bold text-sm mb-2" style={{ color: '#1E293B' }}>{server.name}</h4>
                    <div className="space-y-1 text-xs" style={{ color: '#475569' }}>
                      <p><strong>IP:</strong> {server.ip_address}</p>
                      <p><strong>Location:</strong> {server.location_name}</p>
                      <p>
                        <strong>Status:</strong>{' '}
                        <span style={{ color, fontWeight: 600 }}>
                          {STATUS_LABELS[server.status] || server.status}
                        </span>
                      </p>
                      <p><strong>Health:</strong> {server.health_score}/100</p>
                      <p><strong>Latency:</strong> {server.latency_ms?.toFixed(1) ?? '—'}ms</p>
                      <p><strong>Uptime:</strong> {server.uptime_percent?.toFixed(1) ?? '—'}%</p>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        <MapLegend />
      </div>
    </div>
  );
}
