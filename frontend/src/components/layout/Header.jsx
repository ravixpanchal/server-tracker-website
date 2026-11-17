import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CircleUser, Menu, Network, Search } from 'lucide-react';
import { alertsAPI } from '../../services/api';

export default function Header({ title, wsConnected, collapsed, mobileOpen, onMenuClick }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateCount = () => alertsAPI.unreadCount()
      .then(res => setUnreadCount(res.data.count || 0))
      .catch(() => {});
    updateCount();
    const interval = setInterval(updateCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) navigate(`/servers?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-40 flex h-[var(--app-header-height)] min-w-0 pt-[env(safe-area-inset-top)] items-center justify-between gap-2 border-b border-[var(--border-color)] bg-white px-3 transition-[left] duration-200 sm:gap-4 sm:px-6 ${collapsed ? 'lg:left-[72px]' : 'lg:left-[260px]'}`}>
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label="Open navigation" aria-controls="dashboard-sidebar" aria-expanded={mobileOpen}
          onClick={onMenuClick} className="grid size-11 shrink-0 place-items-center rounded-xl text-primary-600 hover:bg-[var(--bg-tint)] lg:hidden">
          <Menu className="size-5" />
        </button>
        <p className="truncate text-sm font-bold text-primary-700" title={title}>{title}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <form onSubmit={handleSearchSubmit} role="search" className="relative hidden md:block">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-600" />
          <input type="search" aria-label="Search servers" placeholder="Search servers" value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="w-36 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] py-2 pl-9 pr-3 text-sm lg:w-44 xl:w-48" />
        </form>
        <span className="hidden items-center gap-2 rounded-full bg-[var(--bg-tint)] px-3 py-1.5 text-xs font-semibold text-primary-700 xl:flex">
          <span className={`size-2 rounded-full ${wsConnected ? 'bg-emerald-600' : 'bg-amber-600'}`} />
          {wsConnected ? 'Telemetry live' : 'Connecting'}
        </span>
        <button type="button" onClick={() => navigate('/topology')} aria-label="Network topology" title="Network topology"
          className="hidden size-11 cursor-pointer place-items-center rounded-xl text-primary-600 hover:bg-[var(--bg-tint)] xl:grid">
          <Network className="size-5" />
        </button>
        <button type="button" onClick={() => navigate('/alerts')} aria-label="Active alerts" title="Active alerts"
          className="relative grid size-11 cursor-pointer place-items-center rounded-xl text-primary-600 hover:bg-[var(--bg-tint)]">
          <Bell className="size-5" />
          {unreadCount > 0 && <span className="absolute right-2.5 top-2 size-2.5 rounded-full border-2 border-white bg-rose-600" />}
        </button>
        <CurrentTime />
        <button type="button" onClick={() => navigate('/settings')} aria-label="Account settings" title="Account settings"
          className="grid size-11 cursor-pointer place-items-center rounded-xl text-primary-600 hover:bg-[var(--bg-tint)]">
          <CircleUser className="size-5" />
        </button>
      </div>
    </header>
  );
}

const istTime = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function CurrentTime() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="hidden whitespace-nowrap text-xs tabular-nums text-[var(--text-secondary)] 2xl:inline">
      {istTime.format(time)} IST
    </span>
  );
}
