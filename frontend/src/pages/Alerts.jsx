import { useState, useEffect, useCallback } from 'react';
import { alertsAPI } from '../services/api';
import { formatDate } from '../lib/utils';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const params = {};
      if (filter !== 'all') params.severity = filter;
      const res = await alertsAPI.list(params).catch(() => null);
      if (res?.data) setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const defaultAlerts = [
    { id: 1, server_name: 'CCTV-SERVER-02', severity: 'critical', message: 'Connection timeout. Ping failed.', is_read: false, created_at: new Date().toISOString() },
    { id: 2, server_name: 'APP-SERVER-03', severity: 'medium', message: 'CPU usage spiked to 88%. Memory high.', is_read: false, created_at: new Date(Date.now() - 1200000).toISOString() },
    { id: 3, server_name: 'DB-SERVER-01', severity: 'low', message: 'Routine database index maintenance finished.', is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
  ];

  const displayAlerts = alerts.length > 0 ? alerts : defaultAlerts;

  const markRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    alertsAPI.markRead(id).catch(() => {});
  };

  const markAllRead = () => {
    setMarkingAll(true);
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    alertsAPI.markAllRead().catch(() => {}).finally(() => setMarkingAll(false));
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['all', 'critical', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                  : 'bg-indigo-950/40 text-slate-400 border border-indigo-900/30 hover:bg-indigo-900/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={markAllRead}
          disabled={markingAll}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold font-mono hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/25"
        >
          {markingAll ? 'Marking...' : 'Mark All Read'}
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-xs text-slate-400">Loading alerts feed...</div>
        ) : (
          displayAlerts.map(alert => {
            const isCrit = alert.severity === 'critical';
            const isMed = alert.severity === 'medium';
            return (
              <div
                key={alert.id}
                className={`glass-panel p-4 rounded-2xl flex items-start justify-between gap-4 border-l-4 transition-all ${
                  isCrit ? 'border-l-rose-500 bg-rose-500/5' : isMed ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-emerald-500'
                } ${alert.is_read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`material-symbols-outlined text-lg mt-0.5 ${
                    isCrit ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {isCrit ? 'error' : isMed ? 'warning' : 'info'}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-indigo-100 font-mono">{alert.server_name}</span>
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                        isCrit ? 'bg-rose-950/50 text-rose-400 border border-rose-500/30' : isMed ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-1">{alert.message}</p>
                    <span className="text-[10px] font-mono text-slate-400">{formatDate(alert.created_at)}</span>
                  </div>
                </div>

                {!alert.is_read && (
                  <button
                    onClick={() => markRead(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 hover:bg-indigo-900/60 text-xs font-mono transition-all cursor-pointer shrink-0"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
