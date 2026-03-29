import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function LatencyChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          ⚡ Latency Trend
        </h3>
        <div className="skeleton h-[200px] rounded-xl" />
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    time: d.timestamp.split(' ')[1] || d.timestamp,
  }));

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        ⚡ Latency Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="latAvgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="latMaxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickFormatter={(v) => `${v}ms`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
          formatter={(value, name) => [`${(value ?? 0).toFixed(1)}ms`, name === 'avg_latency' ? 'Average' : 'Max']}
          />
          <Area
            type="monotone"
            dataKey="max_latency"
            stroke="#EF4444"
            strokeWidth={1}
            fill="url(#latMaxGrad)"
            strokeDasharray="3 3"
          />
          <Area
            type="monotone"
            dataKey="avg_latency"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#latAvgGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
