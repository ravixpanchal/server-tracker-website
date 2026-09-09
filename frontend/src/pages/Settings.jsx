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
        <h2 className="text-2xl font-bold text-indigo-100">NOC Settings & Configuration</h2>
        <p className="text-sm text-slate-300">Manage telemetry polling intervals, alert preferences, and NOC system parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Account Info */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-900/30 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-indigo-400">account_circle</span> Active Account Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-sans">Username</label>
              <input type="text" disabled value={user?.username || 'admin'} className="w-full px-3 py-2 bg-indigo-950/60 border border-indigo-800/40 rounded-xl text-indigo-100" />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-sans">Role / Permission</label>
              <input type="text" disabled value={user?.role || 'Administrator'} className="w-full px-3 py-2 bg-indigo-950/60 border border-indigo-800/40 rounded-xl text-indigo-100 uppercase" />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-900/30 space-y-4">
          <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-indigo-400">tune</span> Telemetry & Alert Preferences
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/30">
              <div>
                <p className="font-semibold text-indigo-100">Auto-Refresh Dashboard</p>
                <p className="text-slate-400 text-[11px]">Periodically fetch live telemetry data every {telemetryInterval}s</p>
              </div>
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={e => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/30">
              <div>
                <p className="font-semibold text-indigo-100">Audio Alert Notifications</p>
                <p className="text-slate-400 text-[11px]">Play audio tone when critical server failure is detected</p>
              </div>
              <input 
                type="checkbox" 
                checked={soundAlerts} 
                onChange={e => setSoundAlerts(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-200 mb-1">Telemetry Polling Interval (seconds)</label>
              <select 
                value={telemetryInterval} 
                onChange={e => setTelemetryInterval(e.target.value)}
                className="w-full sm:w-64 bg-indigo-950/60 text-indigo-100 border border-indigo-800/40 rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
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
            <span className="text-xs text-emerald-400 font-mono font-bold">✓ Settings saved successfully!</span>
          )}
          <div className="flex-1"></div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs font-mono hover:from-indigo-500 hover:to-violet-500 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
