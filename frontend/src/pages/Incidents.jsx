import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { formatDate, formatDuration } from '../lib/utils';
import { Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.incidents(100)
      .then(res => setIncidents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Showing {incidents.length} incidents
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5"
          style={{ background: 'var(--border-color)' }}
        />

        <div className="space-y-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="ml-14">
                <div className="skeleton h-24 rounded-2xl" />
              </div>
            ))
          ) : incidents.length === 0 ? (
            <div className="ml-14 glass-card p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-success-500/40" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No incidents recorded</p>
            </div>
          ) : (
            incidents.map((incident, i) => {
              const isResolved = !!incident.resolved_at;
              return (
                <div key={incident.id} className="flex items-start gap-4 fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  {/* Timeline dot */}
                  <div className="relative z-10 shrink-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isResolved ? 'bg-success-500/15' : 'bg-danger-500/15'
                    }`}>
                      {isResolved
                        ? <CheckCircle className="w-5 h-5 text-success-500" />
                        : <AlertCircle className="w-5 h-5 text-danger-500" />
                      }
                    </div>
                  </div>

                  {/* Content */}
                  <div className="glass-card p-4 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {incident.server_name}
                          </h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isResolved
                              ? 'bg-success-500/15 text-success-600 dark:text-success-400'
                              : 'bg-danger-500/15 text-danger-600 dark:text-danger-400'
                          }`}>
                            {isResolved ? 'Resolved' : 'Active'}
                          </span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {incident.description || 'Server outage detected'}
                        </p>
                      </div>

                      {incident.duration_seconds && (
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Clock className="w-3 h-3" />
                            <span className="font-mono">{formatDuration(incident.duration_seconds)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{formatDate(incident.started_at)}</span>
                      {isResolved && (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          <span>{formatDate(incident.resolved_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
