import { useState, useEffect } from 'react';
import { analyticsAPI, exportAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

const PIE_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#6B7280'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sumRes, failRes] = await Promise.all([
          analyticsAPI.summary(),
          analyticsAPI.failureFrequency(),
        ]);
        setSummary(sumRes.data);
        setFailures(failRes.data);
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
      a.download = `server_logs.${type === 'csv' ? 'csv' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Pie chart data
  const pieData = summary ? [
    { name: 'Active', value: summary.active_count },
    { name: 'Down', value: summary.down_count },
    { name: 'Warning', value: summary.warning_count },
    { name: 'Maintenance', value: summary.maintenance_count },
  ].filter(d => d.value > 0) : [];

  // Top 10 failure frequency
  const top10Failures = failures.slice(0, 10);

  return (
    <div className="space-y-6 fade-in">
      {/* Export buttons */}
      <div className="flex items-center gap-3 justify-end">
        <button
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <FileText className="w-4 h-4" /> Export CSV
        </button>
        <button
          onClick={() => handleExport('excel')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status distribution */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📊 Server Status Distribution
          </h3>
          {loading ? (
            <div className="skeleton h-[250px] rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Failure frequency */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            🔧 Failure Frequency (Top 10)
          </h3>
          {loading ? (
            <div className="skeleton h-[250px] rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={top10Failures} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis
                  type="category"
                  dataKey="server_name"
                  tick={{ fontSize: 9, fill: 'var(--text-secondary)' }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="failure_count" fill="#EF4444" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary stats table */}
      {summary && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            📋 System Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Alerts', value: summary.total_alerts, color: '#3B82F6' },
              { label: 'Critical (Unread)', value: summary.critical_alerts, color: '#EF4444' },
              { label: 'Fleet Uptime', value: `${(summary.avg_uptime ?? 0).toFixed(1)}%`, color: '#10B981' },
              { label: 'Avg Latency', value: `${(summary.avg_latency ?? 0).toFixed(0)}ms`, color: '#8B5CF6' },
            ].map(item => (
              <div key={item.label} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-primary)' }}>
                <p className="text-2xl font-bold count-up" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
