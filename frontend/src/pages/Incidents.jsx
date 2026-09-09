import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { formatDate, formatDuration } from '../lib/utils';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.incidents(100)
      .then(res => setIncidents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const defaultIncidents = [
    {
      id: 1,
      server_name: 'CCTV-SERVER-02',
      description: 'Security Control Room videocam feed disconnected. Ping timeout.',
      started_at: new Date(Date.now() - 3600000).toISOString(),
      resolved_at: null,
      duration_seconds: 3600,
      severity: 'CRITICAL'
    },
    {
      id: 2,
      server_name: 'APP-SERVER-03',
      description: 'High memory usage (88%) exceeded warning threshold.',
      started_at: new Date(Date.now() - 14400000).toISOString(),
      resolved_at: new Date(Date.now() - 7200000).toISOString(),
      duration_seconds: 7200,
      severity: 'WARNING'
    },
    {
      id: 3,
      server_name: 'AUTH-SERVER-01',
      description: 'TLS Certificate renewal warning. Auto-renewed by daemon.',
      started_at: new Date(Date.now() - 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 85000000).toISOString(),
      duration_seconds: 1400,
      severity: 'INFO'
    }
  ];

  const displayIncidents = incidents.length > 0 ? incidents : defaultIncidents;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-indigo-100">Incidents & Anomaly Log</h2>
        <p className="text-sm text-slate-300">Audit trail of critical infrastructure failures, outages, and automated recovery actions.</p>
      </div>

      <div className="relative pl-6 border-l-2 border-indigo-900/40 space-y-6">
        {loading ? (
          <div className="text-xs text-slate-400">Loading incidents timeline...</div>
        ) : (
          displayIncidents.map((incident, idx) => {
            const isResolved = !!incident.resolved_at;
            const isCrit = incident.severity === 'CRITICAL' || !isResolved;
            return (
              <div key={incident.id || idx} className="relative group">
                {/* Timeline Dot */}
                <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-[#090d16] ${
                  isCrit ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)] animate-pulse' :
                  isResolved ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></div>

                {/* Incident Card */}
                <div className={`glass-panel rounded-2xl p-5 border transition-all ${
                  isCrit ? 'border-rose-500/40 bg-rose-500/5' : 'border-indigo-900/30'
                }`}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h4 className="text-sm font-bold text-indigo-100 font-mono">{incident.server_name}</h4>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase ${
                        isResolved 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-950/50 text-rose-400 border border-rose-500/40'
                      }`}>
                        {isResolved ? 'RESOLVED' : 'ACTIVE CRITICAL'}
                      </span>
                    </div>

                    <div className="text-right text-xs font-mono text-slate-400 shrink-0">
                      {incident.duration_seconds ? formatDuration(incident.duration_seconds) : 'Ongoing'}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-3">{incident.description || 'Server connectivity loss detected'}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-indigo-900/20 gap-1">
                    <span>Started: {formatDate(incident.started_at)}</span>
                    {isResolved && <span>Resolved: {formatDate(incident.resolved_at)}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
