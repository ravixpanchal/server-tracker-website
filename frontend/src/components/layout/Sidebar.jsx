import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Server, Network, Terminal, AlertTriangle,
  BarChart3, History, Settings, MapPin, LogOut, Shield, User,
  Menu, ChevronLeft
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard', lucideIcon: LayoutDashboard },
  { path: '/servers', label: 'Servers', icon: 'dns', lucideIcon: Server },
  { path: '/topology', label: 'Network Topology', icon: 'hub', lucideIcon: Network },
  { path: '/locations', label: 'Locations', icon: 'distance', lucideIcon: MapPin },
  { path: '/logs', label: 'Live Logs', icon: 'terminal', lucideIcon: Terminal },
  { path: '/incidents', label: 'Incidents', icon: 'warning', lucideIcon: History },
  { path: '/analytics', label: 'Analytics', icon: 'analytics', lucideIcon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: 'notifications_active', lucideIcon: AlertTriangle },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleNavClick = () => {
    if (window.innerWidth < 768 && setCollapsed) {
      setCollapsed(true);
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col bg-[#050c26] border-r border-blue-900/30 text-white transition-all duration-300 ease-in-out shadow-2xl ${
        collapsed ? '-translate-x-full md:translate-x-0 md:w-[72px]' : 'translate-x-0 w-[260px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-blue-900/30 h-[64px] bg-[#04091e]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20 tracking-tight border border-blue-400/30">
              AAI
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white tracking-tight leading-tight flex items-center gap-1">
                AAI <span className="text-cyan-400 text-sm">✈️</span>
              </h1>
              <p className="text-[10px] text-blue-300/80 uppercase tracking-wider font-bold">ServerWatch NOC</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs mx-auto shadow-md border border-blue-400/30">
            AAI
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors p-1 hidden md:block"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 group ${
                isActive
                  ? 'text-white bg-blue-600/25 border-l-4 border-[#00f0ff] font-bold shadow-lg shadow-blue-600/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-[#0f1c4d] font-medium'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`material-symbols-outlined text-[18px] shrink-0 ${isActive ? 'text-[#00f0ff]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        <Link
          to="/settings"
          onClick={handleNavClick}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 group ${
            location.pathname === '/settings'
              ? 'text-white bg-blue-600/25 border-l-4 border-[#00f0ff] font-bold shadow-lg shadow-blue-600/10'
              : 'text-slate-400 hover:text-slate-100 hover:bg-[#0f1c4d] font-medium'
          }`}
          title={collapsed ? "Settings" : undefined}
        >
          <span className={`material-symbols-outlined text-[18px] shrink-0 ${location.pathname === '/settings' ? 'text-[#00f0ff]' : 'text-slate-500 group-hover:text-slate-300'}`}>
            settings
          </span>
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-blue-900/30 space-y-2 bg-[#04091e]">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800/30">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md font-bold text-xs">
              {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">{user.username}</p>
              <p className="text-cyan-300 text-[10px] uppercase font-mono">{user.role || 'Operator'}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all w-full cursor-pointer"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
