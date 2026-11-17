import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Server, Network, Terminal, Bell,
  BarChart3, History, Settings, MapPin, LogOut, Plane,
  Menu, PanelLeftClose, X,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/servers', label: 'Servers', icon: Server },
  { path: '/topology', label: 'Network Topology', icon: Network },
  { path: '/locations', label: 'Locations', icon: MapPin },
  { path: '/logs', label: 'Live Logs', icon: Terminal },
  { path: '/incidents', label: 'Incidents', icon: History },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, mobileOpen, onCollapse, onMobileClose }) {
  const { user, logout } = useAuth();

  return (
    <aside id="dashboard-sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex w-[260px] max-w-[calc(100%-2.75rem)] flex-col border-r border-[var(--border-color)] bg-white transition-[transform,width] duration-200 lg:visible lg:translate-x-0 ${collapsed ? 'lg:w-[72px]' : ''} ${mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}>
      <div className={`flex min-h-[var(--app-header-height)] shrink-0 pt-[env(safe-area-inset-top)] items-center gap-3 border-b border-[var(--border-color)] px-3.5 ${collapsed ? 'lg:justify-center' : ''}`}>
        <div className={`grid size-9 shrink-0 place-items-center rounded-xl bg-primary-500 text-white ${collapsed ? 'lg:hidden' : ''}`}>
          <Plane aria-hidden="true" className="size-5" />
        </div>
        <p className={`flex-1 text-sm font-bold text-primary-700 ${collapsed ? 'lg:hidden' : ''}`}>AAI Server Tracker</p>
        <button type="button" onClick={onCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-primary-600 hover:bg-[var(--bg-tint)] lg:grid">
          {collapsed ? <Menu className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>
        <button type="button" aria-label="Close navigation" onClick={onMobileClose}
          className="grid size-10 place-items-center rounded-xl text-primary-600 hover:bg-[var(--bg-tint)] lg:hidden">
          <X className="size-5" />
        </button>
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} end onClick={onMobileClose} title={label} aria-label={label}
            className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${collapsed ? 'lg:justify-center lg:px-0' : ''} ${isActive ? 'bg-primary-500 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tint)] hover:text-primary-700'}`}>
            <Icon aria-hidden="true" className="size-[18px] shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-2 border-t border-[var(--border-color)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {user && (
          <div className={`rounded-xl bg-[var(--bg-tint)] px-3 py-2 ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="truncate text-sm font-bold">{user.username}</p>
            <p className="text-xs capitalize text-[var(--text-secondary)]">{user.role || 'Operator'}</p>
          </div>
        )}
        <button onClick={logout} title="Sign out" aria-label="Sign out"
          className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <LogOut aria-hidden="true" className="size-[18px] shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
