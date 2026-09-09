import { Server, Activity, AlertTriangle, Gauge, Clock, Wifi } from 'lucide-react';

export default function StatsCards({ summary }) {
  if (!summary) return <StatsCardsSkeleton />;

  const cards = [
    {
      label: 'Total Servers',
      value: summary.total_servers,
      icon: Server,
      color: 'from-indigo-600 to-indigo-800',
      textColor: 'text-white',
    },
    {
      label: 'Active',
      value: summary.active_count,
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-white',
    },
    {
      label: 'Down',
      value: summary.down_count,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      textColor: 'text-white',
    },
    {
      label: 'Warning',
      value: summary.warning_count,
      icon: Gauge,
      color: 'from-amber-500 to-orange-600',
      textColor: 'text-white',
    },
    {
      label: 'Avg Uptime',
      value: `${(summary.avg_uptime ?? 0).toFixed(1)}%`,
      icon: Clock,
      color: 'from-indigo-500 to-violet-600',
      textColor: 'text-white',
    },
    {
      label: 'Avg Latency',
      value: `${(summary.avg_latency ?? 0).toFixed(0)}ms`,
      icon: Wifi,
      color: 'from-violet-600 to-purple-800',
      textColor: 'text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-4 shadow-lg fade-in`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.textColor} count-up`}>{card.value}</p>
            <p className={`text-xs ${card.textColor} opacity-80 mt-1`}>{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton h-28 rounded-2xl" />
      ))}
    </div>
  );
}
