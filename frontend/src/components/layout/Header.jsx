import { useState, useEffect } from 'react';
import { Bell, Search, Wifi, WifiOff, Menu } from 'lucide-react';
import { alertsAPI } from '../../services/api';
import { formatDate } from '../../lib/utils';

export default function Header({ title, wsConnected, onMenuClick }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    alertsAPI.unreadCount()
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});
    const interval = setInterval(() => {
      alertsAPI.unreadCount()
        .then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
    >
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            className="md:hidden p-2 -ml-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors" 
            onClick={onMenuClick}
            style={{ color: 'var(--text-secondary)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2
          className="text-lg font-semibold truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
          wsConnected
            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
        }`}>
          {wsConnected
            ? <><Wifi className="w-3.5 h-3.5" /> Live</>
            : <><WifiOff className="w-3.5 h-3.5" /> Offline</>
          }
        </div>

        {/* Alert bell */}
        <button className="relative p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors">
          <Bell className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center count-up">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Current time */}
        <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <CurrentTime />
        </div>
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
    <span>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
  );
}
