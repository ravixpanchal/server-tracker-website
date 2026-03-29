import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function UptimeChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          📈 Uptime Trend
        </h3>
        <div className="skeleton h-[200px] rounded-xl" />
      </div>
    );
  }

  // Format timestamps for display
  const chartData = data.map(d => ({
    ...d,
    time: d.timestamp.split(' ')[1] || d.timestamp,
  }));

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        📈 Uptime Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="uptimeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
            formatter={(value) => [`${(value ?? 0).toFixed(1)}%`, 'Uptime']}
          />
          <Area
            type="monotone"
            dataKey="uptime_percent"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#uptimeGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
