import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useWebSocket } from '../../hooks/useWebSocket';
import { LayoutDashboard, Server, Network, Terminal, AlertTriangle } from 'lucide-react';

const pageTitles = {
  '/': 'Infrastructure Overview',
  '/servers': 'Server Details & Real-time Telemetry',
  '/topology': 'Network Topology',
  '/locations': 'Infrastructure Locations',
  '/logs': 'Live Server Logs',
  '/incidents': 'Incidents & Anomaly Log',
  '/analytics': 'System Analytics & Performance',
  '/alerts': 'Active Alerts & Notifications',
  '/settings': 'NOC Settings & System Config',
};

const mobileNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/servers', label: 'Servers', icon: Server },
  { path: '/topology', label: 'Topology', icon: Network },
  { path: '/logs', label: 'Logs', icon: Terminal },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 768);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsData, setWsData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  const handleWsMessage = useCallback((data) => {
    setWsData(data);
    setWsConnected(true);
  }, []);

  const { connected } = useWebSocket(handleWsMessage);

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative font-sans transition-colors duration-300">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className="flex-1 flex flex-col w-full h-screen overflow-hidden">
        <Header 
          title={title} 
          wsConnected={connected} 
          collapsed={collapsed}
          onMenuClick={() => setCollapsed(!collapsed)} 
        />
        <main 
          className={`pt-[64px] pb-[60px] md:pb-0 transition-all duration-300 flex-1 overflow-y-auto ${
            collapsed ? 'md:ml-[72px] ml-0' : 'md:ml-[260px] ml-0'
          } bg-[var(--bg-primary)]`}
        >
          <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 min-h-[calc(100vh-64px)]">
            <Outlet context={{ wsData, wsConnected: connected }} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050c26]/95 backdrop-blur-xl border-t border-blue-900/40 flex items-stretch justify-around px-1 shadow-2xl" style={{ height: '60px' }}>
        {mobileNavItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-2 flex-1 transition-colors min-w-0 ${
                isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : ''}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full text-center ${isActive ? 'text-cyan-400' : ''}`}>
                {label}
              </span>
              {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-t-full" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
