import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import TerminalPanel from '../components/layout/TerminalPanel';
import { serversAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, getStatusColor } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Search, Terminal, RefreshCw, Server as ServerIcon } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Servers() {
  const { isAdmin } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editServer, setEditServer] = useState(null);
  const [search, setSearch] = useState('');
  const [restarting, setRestarting] = useState(false);
  const [sshActive, setSshActive] = useState(false);

  const fetchServers = async () => {
    try {
      const res = await serversAPI.list();
      const list = Array.isArray(res.data) ? res.data : res.data.servers ?? res.data.items ?? [];
      setServers(list);
      if (list.length > 0 && !selectedServer) {
        setSelectedServer(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this server?')) return;
    try {
      await serversAPI.delete(id);
      fetchServers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error deleting server');
    }
  };

  // Generate telemetry chart data
  const chartData = useMemo(() => {
    const times = ['-20m', '-18m', '-16m', '-14m', '-12m', '-10m', '-8m', '-6m', '-4m', '-2m', 'Now'];
    return times.map((t, i) => ({
      time: t,
      cpu: Math.floor(30 + Math.random() * 25 + (i % 3) * 5),
      memory: Math.floor(60 + Math.random() * 15),
      disk: Math.floor(18 + Math.random() * 14),
      netIn: Math.floor(900 + Math.random() * 400),
      netOut: Math.floor(600 + Math.random() * 300),
    }));
  }, [selectedServer]);

  const activeServer = selectedServer || {
    name: 'DB-SERVER-01',
    ip_address: '192.168.1.10',
    location_name: 'Server Room A - Rack 04',
    status: 'active',
    health_score: 99.8,
    os: 'Ubuntu 22.04 LTS',
    uptime: '14d 6h 32m',
    heartbeat: '2s ago',
    latency: '12ms'
  };

  const filtered = servers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ip_address.includes(search) ||
    s.location_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRestart = () => {
    setRestarting(true);
    setTimeout(() => {
      setRestarting(false);
      alert(`Services on ${activeServer.name} restarted successfully.`);
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 fade-in">
      {/* Detail Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="text-xs text-[var(--text-secondary)] font-mono mb-2">
            Servers / {activeServer.name}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="break-all text-xl font-bold text-[var(--text-primary)] sm:text-2xl">{activeServer.name}</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] pulse-dot"></span>
              {activeServer.status?.toUpperCase() === 'DOWN' ? 'OFFLINE' : 'ONLINE'}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Primary Server Node — {activeServer.location_name || 'Cluster Alpha'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setSshActive(!sshActive)}
            className={`min-h-11 px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer hover-lift ${
              sshActive 
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30' 
                : 'bg-[var(--bg-tint)] border-[var(--border-color)] text-primary-600 hover:bg-[var(--bg-tint)]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            {sshActive ? 'SSH Connected' : 'SSH Connect'}
          </button>
          <button 
            onClick={handleRestart}
            disabled={restarting}
            className="min-h-11 px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-sm shadow-indigo-600/25 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${restarting ? 'animate-spin' : ''}`} />
            {restarting ? 'Restarting...' : 'Restart Services'}
          </button>
        </div>
      </div>

      {/* SSH Simulated Terminal Window */}
      {sshActive && (
        <TerminalPanel
          className="fade-in"
          title={`root@${activeServer.name.toLowerCase()}:~# ssh-session (active)`}
          action={(
            <button type="button" aria-label="Close SSH terminal" onClick={() => setSshActive(false)}
              className="shrink-0 cursor-pointer rounded px-2 py-1 text-rose-300 hover:bg-white/10 hover:text-rose-100">
              close [X]
            </button>
          )}
        >
          <div className="space-y-1 p-2 leading-relaxed break-words sm:p-4">
            <p className="text-indigo-300">Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-88-generic x86_64)</p>
            <p className="text-slate-300">System load: 0.42 | Processes: 184 | Memory usage: 61%</p>
            <p><span className="text-emerald-400">root@{activeServer.name.toLowerCase()}:~#</span> systemctl status daemon.service</p>
            <p className="text-emerald-400">● daemon.service - ServerWatch Monitoring Agent</p>
            <p className="text-slate-300">Loaded: loaded (/etc/systemd/system/daemon.service; enabled)</p>
            <p className="text-slate-300">Active: <span className="text-emerald-400">active (running)</span> since Mon 2026-08-24 00:00:12 IST; 14 days ago</p>
          </div>
        </TerminalPanel>
      )}

      {/* Bento Detail Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <div className="glass-panel rounded-xl p-4 flex flex-col justify-center">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">router</span> IP Address
          </span>
          <div className="font-mono text-base font-semibold text-[var(--color-primary)]">{activeServer.ip_address}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex flex-col justify-center">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">computer</span> Operating System
          </span>
          <div className="text-sm font-medium text-[var(--text-primary)]">{activeServer.os || 'Ubuntu 22.04 LTS'}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex flex-col justify-center">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">dns</span> Server Location
          </span>
          <div className="text-sm font-medium text-[var(--text-primary)] truncate">{activeServer.location_name || 'Server Room A'}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex flex-col justify-center">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span> Uptime
          </span>
          <div className="font-mono text-base text-[var(--text-primary)]">{activeServer.uptime || '14d 6h 32m'}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex flex-col justify-center">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">favorite</span> Last Heartbeat
          </span>
          <div className="font-mono text-base text-[var(--color-secondary)]">{activeServer.heartbeat || '2s ago'}</div>
        </div>

        <div className="glass-panel rounded-xl p-4 flex flex-col justify-center">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">network_ping</span> Latency
          </span>
          <div className="font-mono text-base text-[var(--text-primary)]">
            {activeServer.latency || '12ms'} <span className="text-[var(--color-secondary)] text-xs">↓ 1ms</span>
          </div>
        </div>
      </div>

      {/* Monitoring Charts Section */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <span className="material-symbols-outlined text-[var(--color-primary)]">monitoring</span> Real-time Telemetry
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CPU Chart */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">CPU Usage</h4>
              <span className="text-xs font-mono text-[var(--color-error)]">42% Avg</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffb2b7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ffb2b7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#8c909f" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8c909f" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#102034', borderColor: '#424754', borderRadius: '8px', color: '#d3e4fe' }} />
                  <Area type="monotone" dataKey="cpu" stroke="#ffb2b7" strokeWidth={2} fillOpacity={1} fill="url(#cpuGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Memory Chart */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">Memory Usage</h4>
              <span className="text-xs font-mono text-[var(--color-primary)]">68% Avg</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#adc6ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#adc6ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#8c909f" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8c909f" fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#102034', borderColor: '#424754', borderRadius: '8px', color: '#d3e4fe' }} />
                  <Area type="monotone" dataKey="memory" stroke="#adc6ff" strokeWidth={2} fillOpacity={1} fill="url(#memGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disk Chart */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">Disk I/O</h4>
              <span className="text-xs font-mono text-[var(--color-secondary)]">24 MB/s</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" stroke="#8c909f" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8c909f" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#102034', borderColor: '#424754', borderRadius: '8px', color: '#d3e4fe' }} />
                  <Line type="monotone" dataKey="disk" stroke="#4edea3" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Network Chart */}
          <div className="glass-panel rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-semibold text-[var(--text-primary)]">Network Traffic</h4>
              <span className="text-xs font-mono text-[var(--color-primary)]">1.2 GB/s In / 0.8 GB/s Out</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" stroke="#8c909f" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8c909f" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#102034', borderColor: '#424754', borderRadius: '8px', color: '#d3e4fe' }} />
                  <Line type="monotone" dataKey="netIn" name="In (MB/s)" stroke="#adc6ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="netOut" name="Out (MB/s)" stroke="#d8e2ff" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* All Servers Management Table Section */}
      <section className="glass-panel rounded-xl overflow-hidden p-3 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <ServerIcon className="w-4 h-4 text-[var(--color-primary)]" /> Server Registry & Inventory
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search server registry..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="min-h-11 w-full pl-9 pr-3 py-1.5 rounded-xl bg-[var(--bg-tint)] border border-[var(--border-color)] text-base sm:text-sm text-primary-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            {isAdmin && (
              <button
                onClick={() => { setEditServer(null); setShowForm(true); }}
                className="flex items-center gap-1.5 min-h-11 px-3 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all cursor-pointer shrink-0 shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" /> Add Server
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto" role="region" aria-label="Server registry" tabIndex={0}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-tint)] border-b border-[var(--border-color)] text-[11px] font-bold text-primary-600 uppercase tracking-wider">
                <th className="py-3 px-1.5 sm:px-4">Server Name</th>
                <th className="py-3 px-1.5 sm:px-4 hidden md:table-cell">IP Address</th>
                <th className="py-3 px-1.5 sm:px-4 hidden sm:table-cell">Location</th>
                <th className="py-3 px-1.5 sm:px-4">Status</th>
                <th className="py-3 px-1.5 sm:px-4 hidden lg:table-cell">Health Score</th>
                <th className="py-3 px-1.5 sm:px-4 hidden xl:table-cell">Last Heartbeat</th>
                {isAdmin && <th className="py-3 px-1.5 sm:px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="font-mono">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-[var(--text-secondary)]">Loading servers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-[var(--text-secondary)]">No servers found</td>
                </tr>
              ) : (
                filtered.map(server => {
                  const statusColors = getStatusColor(server.status);
                  const isSelected = selectedServer?.id === server.id || selectedServer?.name === server.name;
                  return (
                    <tr
                      key={server.id}
                      onClick={() => setSelectedServer(server)}
                      className={`border-b border-[var(--border-color)] table-row-hover transition-colors cursor-pointer ${
                        isSelected ? 'bg-indigo-600/15 text-primary-600 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-1.5 sm:px-4 font-sans font-medium text-primary-600">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-primary-600 shrink-0">dns</span>
                          <span className="break-all leading-snug">{server.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-1.5 sm:px-4 text-[var(--text-secondary)] hidden md:table-cell">{server.ip_address}</td>
                      <td className="py-3 px-1.5 sm:px-4 font-sans text-[var(--text-secondary)] hidden sm:table-cell">{server.location_name}</td>
                      <td className="py-3 px-1.5 sm:px-4 font-sans">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          <span className="status-dot online"></span>
                          {(server.status || 'ACTIVE').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-1.5 sm:px-4 font-mono hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[var(--bg-tint)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${server.health_score || 95}%`,
                                background: (server.health_score || 95) > 70 ? '#34d399' : '#fb7185',
                              }}
                            />
                          </div>
                          <span>{server.health_score || 95}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-1.5 sm:px-4 text-[var(--text-secondary)] text-[11px] hidden xl:table-cell">
                        {formatDate(server.last_heartbeat)}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-1.5 sm:px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditServer(server); setShowForm(true); }}
                              className="grid size-8 place-items-center rounded hover:bg-indigo-500/20 text-primary-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(server.id)}
                              className="grid size-8 place-items-center rounded hover:bg-rose-500/20 text-rose-700 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {showForm && (
        <ServerFormModal
          server={editServer}
          onClose={() => { setShowForm(false); setEditServer(null); }}
          onSaved={fetchServers}
        />
      )}
    </div>
  );
}

function ServerFormModal({ server, onClose, onSaved }) {
  const isEdit = !!server;
  const [form, setForm] = useState({
    name: server?.name || '',
    ip_address: server?.ip_address || '',
    latitude: server?.latitude || '',
    longitude: server?.longitude || '',
    location_name: server?.location_name || '',
    airport_code: server?.airport_code || '',
    description: server?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude) || 20.0,
        longitude: parseFloat(form.longitude) || 78.0,
      };
      if (isEdit) {
        await serversAPI.update(server.id, payload);
      } else {
        await serversAPI.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error saving server');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/75 p-3 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="server-form-heading" className="glass-panel w-full max-w-lg rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 id="server-form-heading" className="text-base font-bold text-primary-600">
            {isEdit ? 'Edit Server Configuration' : 'Add New Server Node'}
          </h3>
          <button type="button" aria-label="Close server form" onClick={onClose} className="grid size-11 place-items-center rounded-lg hover:bg-[var(--bg-tint)] text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { key: 'name', label: 'Server Name', placeholder: 'DB-SERVER-01' },
            { key: 'ip_address', label: 'IP Address', placeholder: '192.168.1.10' },
            { key: 'location_name', label: 'Location Name', placeholder: 'Server Room A - Rack 04' },
            { key: 'airport_code', label: 'Airport Code / Tag', placeholder: 'DEL' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label htmlFor={`server-form-${key}`} className="block text-xs font-medium mb-1 text-primary-600">{label}</label>
              <input
                type="text"
                id={`server-form-${key}`}
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                required={key !== 'airport_code'}
                className="min-h-11 w-full px-3 py-2 rounded-xl bg-[var(--bg-tint)] border border-[var(--border-color)] text-base sm:text-sm text-primary-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-11 px-3 py-2 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-tint)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 min-h-11 px-3 py-2 rounded-xl bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 disabled:opacity-50 cursor-pointer shadow-sm shadow-indigo-600/30"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Server' : 'Create Server'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
