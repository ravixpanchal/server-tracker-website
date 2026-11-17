import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wsData, setWsData] = useState(null);
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  const handleWsMessage = useCallback((data) => {
    setWsData(data);
  }, []);

  const { connected } = useWebSocket(handleWsMessage);

  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] relative font-sans transition-colors duration-300">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen}
        onCollapse={() => setCollapsed(value => !value)} onMobileClose={() => setMobileOpen(false)} />
      
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full min-w-0 h-dvh overflow-hidden">
        <Header 
          title={title} 
          wsConnected={connected} 
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onMenuClick={() => setMobileOpen(value => !value)}
        />
        <main ref={mainRef}
          className={`pt-[var(--app-header-height)] pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0 transition-[margin] duration-200 flex-1 overflow-auto overscroll-contain ${
            collapsed ? 'lg:ml-[72px] ml-0' : 'lg:ml-[260px] ml-0'
          } bg-[var(--bg-primary)]`}
        >
          <div className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6">
            <Outlet context={{ wsData, wsConnected: connected }} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--border-color)] flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]" style={{ height: 'calc(60px + env(safe-area-inset-bottom))' }} aria-label="Quick navigation">
        {mobileNavItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              aria-current={isActive ? 'page' : undefined}
              to={path}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-0.5 flex-1 transition-colors min-w-0 ${
                isActive ? 'text-primary-600' : 'text-[var(--text-secondary)] hover:text-primary-600'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wide truncate w-full text-center ${isActive ? 'text-primary-600' : ''}`}>
                {label}
              </span>
              {isActive && <div className="absolute bottom-0 w-8 h-0.5 bg-primary-500 rounded-t-full" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
