import { formatDate, getSeverityColor } from '../../lib/utils';
import { AlertTriangle, Info, AlertCircle, CheckCircle } from 'lucide-react';

const SEVERITY_ICONS = {
  low: CheckCircle,
  medium: AlertTriangle,
  critical: AlertCircle,
};

export default function AlertPanel({ alerts }) {
  if (!alerts) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          🔔 Recent Alerts
        </h3>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const recentAlerts = alerts.slice(0, 8);

  return (
    <div className="glass-card p-4" style={{ maxHeight: '420px' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          🔔 Recent Alerts
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger-500/10 text-danger-500 font-medium">
          {alerts.filter(a => !a.is_read).length} unread
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '350px' }}>
        {recentAlerts.length === 0 ? (
          <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            No alerts yet
          </p>
        ) : (
          recentAlerts.map((alert, i) => {
            const colors = getSeverityColor(alert.severity);
            const Icon = SEVERITY_ICONS[alert.severity] || Info;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all slide-in-right ${colors.bg} ${colors.border} ${
                  !alert.is_read ? 'border-l-4' : 'opacity-70'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colors.text}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {alert.server_name}
                  </p>
                  <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {alert.message}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(alert.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
