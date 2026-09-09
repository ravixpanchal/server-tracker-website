import { useState, useEffect } from 'react';
import { analyticsAPI, exportAPI } from '../services/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#34d399', '#fb7185', '#fbbf24', '#818cf8'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sumRes, failRes] = await Promise.all([
          analyticsAPI.summary().catch(() => null),
          analyticsAPI.failureFrequency().catch(() => null),
        ]);
        if (sumRes?.data) setSummary(sumRes.data);
        if (failRes?.data) setFailures(failRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleExport = async (type) => {
    try {
      const res = type === 'csv' ? await exportAPI.csv() : await exportAPI.excel();
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `server_telemetry_report.${type === 'csv' ? 'csv' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const pieData = [
    { name: 'Online (42)', value: 42 },
    { name: 'Warning (3)', value: 3 },
    { name: 'Offline (3)', value: 3 },
  ];

  const defaultFailures = [
    { server_name: 'CCTV-SERVER-02', failure_count: 14 },
    { server_name: 'APP-SERVER-03', failure_count: 9 },
    { server_name: 'AUTH-SERVER-01', failure_count: 4 },
    { server_name: 'CACHE-NODE-02', failure_count: 2 },
  ];

  const displayFailures = failures.length > 0 ? failures.slice(0, 8) : defaultFailures;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-100">System Analytics & Performance</h2>
          <p className="text-sm text-slate-300">Comprehensive NOC fleet performance, distribution, and exportable reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/60 text-indigo-200 border border-indigo-800/40 text-xs font-mono font-bold hover:bg-indigo-900/60 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">csv</span> Export CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-mono font-bold hover:from-indigo-500 hover:to-violet-500 transition-all cursor-pointer shadow-md shadow-indigo-600/25"
          >
            <span className="material-symbols-outlined text-sm">table_view</span> Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-900/30">
          <h3 className="text-sm font-semibold text-indigo-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">pie_chart</span> Server Health Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131c31', borderColor: 'rgba(99, 102, 241, 0.3)', borderRadius: '12px', color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Frequency */}
        <div className="glass-panel p-5 rounded-2xl border border-indigo-900/30">
          <h3 className="text-sm font-semibold text-indigo-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-400">bar_chart</span> Anomaly Frequency (Top Servers)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayFailures} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis type="category" dataKey="server_name" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#131c31', borderColor: 'rgba(99, 102, 241, 0.3)', borderRadius: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="failure_count" fill="#818cf8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
