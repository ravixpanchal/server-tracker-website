import { Brain, AlertTriangle, TrendingDown, Wrench, Zap } from 'lucide-react';
import { getSeverityColor } from '../../lib/utils';

const INSIGHT_ICONS = {
  anomaly: AlertTriangle,
  prediction: TrendingDown,
  recommendation: Wrench,
};

export default function AIInsights({ insights }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
          <Brain className="w-4 h-4 text-purple-500" />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          AI Insights
        </h3>
        <Zap className="w-3 h-3 text-warning-500" />
      </div>

      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
        {(!insights || insights.length === 0) ? (
          <div className="text-center py-6">
            <Brain className="w-8 h-8 mx-auto mb-2 text-purple-400/40" />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              AI is analyzing server patterns...
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Insights will appear once enough data is collected
            </p>
          </div>
        ) : (
          insights.map((insight, i) => {
            const colors = getSeverityColor(insight.severity);
            const Icon = INSIGHT_ICONS[insight.insight_type] || AlertTriangle;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border} fade-in`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colors.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {insight.server_name}
                    </p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                      {insight.insight_type}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {insight.message}
                  </p>
                  {insight.confidence > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${insight.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {((insight.confidence ?? 0) * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
