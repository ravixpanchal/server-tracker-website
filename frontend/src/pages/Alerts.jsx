import { useState, useEffect, useCallback } from 'react';
import { alertsAPI } from '../services/api';
import { formatDate, getSeverityColor } from '../lib/utils';
import { AlertTriangle, AlertCircle, CheckCircle, Check, Trash2, Filter } from 'lucide-react';

const SEVERITY_ICONS = { low: CheckCircle, medium: AlertTriangle, critical: AlertCircle };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchAlerts = useCallback(async () => {
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
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const markRead = async (id) => {
    // Optimistic update immediately
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    try {
      await alertsAPI.markRead(id);
    } catch (err) {
      console.error(err);
      fetchAlerts(); // revert on error
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    // Optimistic update immediately
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    try {
      await alertsAPI.markAllRead();
    } catch (err) {
      console.error(err);
      fetchAlerts(); // revert on error
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteAlert = async (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    try {
      await alertsAPI.delete(id);
    } catch (err) {
      console.error(err);
      fetchAlerts();
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-6 fade-in">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
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
          {unreadCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
              {unreadCount} unread
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          disabled={markingAll || unreadCount === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            unreadCount === 0
              ? 'opacity-40 cursor-not-allowed text-green-500'
              : 'text-primary-500 hover:bg-primary-500/10 active:scale-95'
          }`}
        >
          {markingAll ? (
            <div className="w-3.5 h-3.5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          {markingAll ? 'Marking...' : 'Mark all read'}
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : alerts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500/40" />
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>No alerts found</p>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const colors = getSeverityColor(alert.severity);
            const Icon = SEVERITY_ICONS[alert.severity] || AlertTriangle;
            return (
              <div
                key={alert.id}
                className="glass-card p-4 flex items-start gap-4 slide-in-right transition-all duration-300 border-l-4"
                style={{
                  animationDelay: `${i * 0.03}s`,
                  borderLeftColor: alert.is_read
                    ? '#22c55e'
                    : alert.severity === 'critical' ? '#EF4444'
                    : alert.severity === 'medium' ? '#F59E0B'
                    : '#3B82F6',
                  opacity: alert.is_read ? 0.65 : 1,
                }}
              >
                {/* Icon with green tick overlay when read */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    alert.is_read ? 'bg-green-500/10' : colors.bg
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      alert.is_read ? 'text-green-500' : colors.text
                    }`} />
                  </div>
                  {alert.is_read && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {alert.server_name}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${colors.bg} ${colors.text}`}>
                      {alert.severity}
                    </span>
                    {alert.is_read && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/10 text-green-600">
                        ✓ Read
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{alert.message}</p>
                  <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{formatDate(alert.created_at)}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!alert.is_read ? (
                    <button
                      onClick={() => markRead(alert.id)}
                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="p-1.5" title="Already read">
                      <CheckCircle className="w-4 h-4 text-green-500 opacity-70" />
                    </div>
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
