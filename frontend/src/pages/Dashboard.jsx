import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import StatsCards from '../components/dashboard/StatsCards';
import ServerMap from '../components/dashboard/ServerMap';
import AlertPanel from '../components/dashboard/AlertPanel';
import UptimeChart from '../components/dashboard/UptimeChart';
import LatencyChart from '../components/dashboard/LatencyChart';
import AIInsights from '../components/dashboard/AIInsights';
import { analyticsAPI, statusAPI, alertsAPI } from '../services/api';

export default function Dashboard() {
  const { wsData } = useOutletContext();
  const [summary, setSummary] = useState(null);
  const [servers, setServers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [uptimeData, setUptimeData] = useState([]);
  const [latencyData, setLatencyData] = useState([]);
  const [insights, setInsights] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, statusRes, alertRes, uptimeRes, latencyRes, insightRes] = await Promise.all([
        analyticsAPI.summary(),
        statusAPI.all(),
        alertsAPI.list({ limit: 20 }),
        analyticsAPI.uptimeTrend(1),
        analyticsAPI.latencyTrend(1),
        analyticsAPI.aiInsights(),
      ]);
      setSummary(sumRes.data);
      setServers(statusRes.data);
      setAlerts(alertRes.data);
      setUptimeData(uptimeRes.data);
      setLatencyData(latencyRes.data);
      setInsights(insightRes.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Update on WebSocket data
  useEffect(() => {
    if (!wsData) return;

    if (wsData.type === 'status_update') {
      setServers(prev =>
        prev.map(s =>
          s.id === wsData.data.server_id
            ? { ...s, ...wsData.data, id: s.id }
            : s
        )
      );
    }

    if (wsData.type === 'new_alert') {
      setAlerts(prev => [wsData.data, ...prev].slice(0, 20));
      // Refresh summary on new alert
      analyticsAPI.summary().then(res => setSummary(res.data)).catch(() => {});
    }

    if (wsData.type === 'ai_insight') {
      if (wsData.data.insights) {
        setInsights(wsData.data.insights);
      }
    }
  }, [wsData]);

  return (
    <div className="space-y-6 fade-in">
      {/* Stats */}
      <StatsCards summary={summary} />

      {/* Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServerMap servers={servers} />
        </div>
        <div>
          <AlertPanel alerts={alerts} />
        </div>
      </div>

      {/* Charts + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <UptimeChart data={uptimeData} />
        </div>
        <div>
          <LatencyChart data={latencyData} />
        </div>
        <div>
          <AIInsights insights={insights} />
        </div>
      </div>
    </div>
  );
}
