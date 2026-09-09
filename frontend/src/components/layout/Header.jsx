import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Header({ title, wsConnected, collapsed, onMenuClick }) {
  const [unreadCount, setUnreadCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    alertsAPI.unreadCount()
      .then(res => setUnreadCount(res.data.count || 1))
      .catch(() => {});
    const interval = setInterval(() => {
      alertsAPI.unreadCount()
        .then(res => setUnreadCount(res.data.count || 1))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/servers?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={`fixed top-0 right-0 h-[64px] bg-[#091233]/90 backdrop-blur-md border-b border-blue-900/40 flex justify-between items-center px-4 sm:px-6 z-40 transition-all duration-300 shadow-lg ${
      collapsed ? 'w-full md:w-[calc(100%-72px)]' : 'w-full md:w-[calc(100%-260px)]'
    }`}>
      {/* Search & Title */}
      <div className="flex items-center gap-4 flex-1">
        {onMenuClick && (
          <button 
            className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white" 
            onClick={onMenuClick}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <h2 className="text-base font-bold text-white md:hidden truncate flex items-center gap-1.5">
          <span className="text-cyan-400">AAI ✈️</span> {title}
        </h2>
        
        {/* Global Search Input - High Tech NOC style */}
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input 
            className="w-full bg-[#050c26] border border-blue-900/40 rounded-full py-1.5 pl-10 pr-9 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500" 
            placeholder="Search AAI airport code, server IP, location, logs..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
            /
          </span>
        </div>
      </div>

      {/* Action Controls & Indicators */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Telemetry Pulse */}
        <div className="hidden lg:flex items-center gap-2 bg-blue-950/60 border border-blue-800/40 text-white px-3.5 py-1 rounded-full shadow-md">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse' : 'bg-rose-500'}`}></span>
          <span className="text-[11px] font-mono font-bold tracking-wide text-cyan-300">
            {wsConnected ? 'AAI TELEMETRY LIVE' : 'CONNECTING...'}
          </span>
        </div>

        {/* Sensors button */}
        <button 
          onClick={() => navigate('/topology')}
          title="Network Topology"
          className="text-slate-300 hover:text-cyan-400 transition-all cursor-pointer p-2 rounded-full hover:bg-blue-900/30"
        >
          <span className="material-symbols-outlined text-[20px]">sensors</span>
        </button>

        {/* Notification Bell */}
        <button 
          onClick={() => navigate('/alerts')}
          title="Active Alerts"
          className="text-slate-300 hover:text-cyan-400 transition-all cursor-pointer p-2 rounded-full hover:bg-blue-900/30 relative"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full status-dot offline border-2 border-[#091233]"></span>
          )}
        </button>

        {/* Current Time Clock */}
        <div className="hidden sm:block text-xs font-mono text-slate-400 border-l border-blue-900/40 pl-3">
          <CurrentTime />
        </div>

        {/* Account Profile Icon */}
        <button 
          onClick={() => navigate('/settings')}
          title="User Profile & Settings"
          className="text-[var(--text-secondary)] hover:text-indigo-400 transition-all cursor-pointer ml-1"
        >
          <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_circle
          </span>
        </button>
      </div>
    </header>
  );
}

function CurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} IST</span>
  );
}
