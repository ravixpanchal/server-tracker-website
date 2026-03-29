import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useWebSocket } from '../../hooks/useWebSocket';

const pageTitles = {
  '/': 'Dashboard',
  '/servers': 'Server Management',
  '/alerts': 'Alerts & Notifications',
  '/analytics': 'Analytics & Reports',
  '/incidents': 'Incident History',
};

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
    <div className="flex h-screen overflow-hidden relative">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Mobile Backdrop */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${
          collapsed ? 'md:ml-[72px] ml-0' : 'md:ml-[260px] ml-0'
        }`}
      >
        <Header 
          title={title} 
          wsConnected={connected} 
          onMenuClick={() => setCollapsed(!collapsed)} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: 'var(--bg-primary)' }}>
          <Outlet context={{ wsData, wsConnected: connected }} />
        </main>
      </div>
    </div>
  );
}
