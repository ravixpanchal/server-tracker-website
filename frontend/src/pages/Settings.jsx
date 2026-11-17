import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [telemetryInterval, setTelemetryInterval] = useState('10');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6 fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-primary-600">NOC Settings & Configuration</h2>
        <p className="text-sm text-[var(--text-secondary)]">Manage telemetry polling intervals, alert preferences, and NOC system parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Account Info */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
          <h3 className="text-sm font-semibold text-primary-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary-600">account_circle</span> Active Account Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-sans">Username</label>
              <input type="text" disabled value={user?.username || 'admin'} className="w-full px-3 py-2 bg-[var(--bg-tint)] border border-[var(--border-color)] rounded-xl text-primary-600" />
            </div>
            <div>
              <label className="block text-[var(--text-secondary)] mb-1 font-sans">Role / Permission</label>
              <input type="text" disabled value={user?.role || 'Administrator'} className="w-full px-3 py-2 bg-[var(--bg-tint)] border border-[var(--border-color)] rounded-xl text-primary-600 uppercase" />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
          <h3 className="text-sm font-semibold text-primary-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary-600">tune</span> Telemetry & Alert Preferences
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-tint)] rounded-xl border border-[var(--border-color)]">
              <div>
                <p className="font-semibold text-primary-600">Auto-Refresh Dashboard</p>
                <p className="text-[var(--text-secondary)] text-[11px]">Periodically fetch live telemetry data every {telemetryInterval}s</p>
              </div>
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={e => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-tint)] rounded-xl border border-[var(--border-color)]">
              <div>
                <p className="font-semibold text-primary-600">Audio Alert Notifications</p>
                <p className="text-[var(--text-secondary)] text-[11px]">Play audio tone when critical server failure is detected</p>
              </div>
              <input 
                type="checkbox" 
                checked={soundAlerts} 
                onChange={e => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-600 mb-1">Telemetry Polling Interval (seconds)</label>
              <select 
                value={telemetryInterval} 
                onChange={e => setTelemetryInterval(e.target.value)}
                className="w-full sm:w-64 bg-[var(--bg-tint)] text-primary-600 border border-[var(--border-color)] rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="5">5 seconds (High Frequency)</option>
                <option value="10">10 seconds (Standard)</option>
                <option value="30">30 seconds (Low Bandwidth)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved && (
            <span className="text-xs text-emerald-700 font-mono font-bold">✓ Settings saved successfully!</span>
          )}
          <div className="flex-1"></div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary-500 text-white font-bold text-xs font-mono hover:bg-primary-600 transition-all shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
