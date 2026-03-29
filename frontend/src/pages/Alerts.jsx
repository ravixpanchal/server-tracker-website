import { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import { formatDate, getSeverityColor } from '../lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle, Check, Trash2, Filter } from 'lucide-react';

const SEVERITY_ICONS = { low: CheckCircle, medium: AlertTriangle, critical: AlertCircle };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.severity = filter;
      const res = await alertsAPI.list(params);
      setAlerts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const markRead = async (id) => {
    await alertsAPI.markRead(id);
    fetchAlerts();
  };

  const markAllRead = async () => {
    await alertsAPI.markAllRead();
    fetchAlerts();
  };

  const deleteAlert = async (id) => {
    await alertsAPI.delete(id);
    fetchAlerts();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          {['all', 'critical', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                  : 'hover:bg-[var(--bg-hover)]'
              }`}
              style={filter !== f ? { color: 'var(--text-secondary)' } : {}}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-primary-500 hover:bg-primary-500/10 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Mark all read
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : alerts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-500/40" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No alerts found</p>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const colors = getSeverityColor(alert.severity);
            const Icon = SEVERITY_ICONS[alert.severity] || AlertTriangle;
            return (
              <div
                key={alert.id}
                className={`glass-card p-4 flex items-start gap-4 slide-in-right ${!alert.is_read ? 'border-l-4' : ''}`}
                style={{
                  animationDelay: `${i * 0.03}s`,
                  borderLeftColor: !alert.is_read ? (alert.severity === 'critical' ? '#EF4444' : alert.severity === 'medium' ? '#F59E0B' : '#3B82F6') : undefined,
                  opacity: alert.is_read ? 0.6 : 1,
                }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.bg}`}>
                  <Icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {alert.server_name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${colors.bg} ${colors.text}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{formatDate(alert.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!alert.is_read && (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
