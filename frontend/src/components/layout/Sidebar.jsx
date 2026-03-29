import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  LayoutDashboard, Server, AlertTriangle, BarChart3,
  History, LogOut, Sun, Moon, Menu, X, Plane, ChevronLeft,
  Shield, User
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/servers', label: 'Servers', icon: Server },
  { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/incidents', label: 'Incidents', icon: History },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? '-translate-x-full md:translate-x-0 md:w-[72px]' : 'translate-x-0 w-[260px]'
      }`}
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Plane className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="fade-in">
            <h1 className="text-white font-bold text-sm leading-tight">AAI Server</h1>
            <p className="text-white/50 text-[10px]">Monitoring System</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white/60 hover:text-white transition-colors p-1 hidden md:block"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-white/5'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
              {!collapsed && <span className="fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/8 transition-all w-full"
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
          {!collapsed && <span className="fade-in">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User info */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 fade-in">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.username}</p>
              <p className="text-white/40 text-[10px] uppercase">{user.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
