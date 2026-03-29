import { useState, useEffect } from 'react';
import { serversAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, getStatusColor } from '../lib/utils';
import { Plus, Edit2, Trash2, X, Search, MapPin } from 'lucide-react';

export default function Servers() {
  const { isAdmin } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editServer, setEditServer] = useState(null);
  const [search, setSearch] = useState('');

  const fetchServers = async () => {
    try {
      const res = await serversAPI.list();
      // setServers(res.data);
      setServers(Array.isArray(res.data) ? res.data : res.data.servers ?? res.data.items ?? []);
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

  const filtered = servers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ip_address.includes(search) ||
    s.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search servers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => { setEditServer(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" /> Add Server
          </button>
        )}
      </div>

      {/* Server table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--bg-hover)' }}>
                {['Name', 'IP Address', 'Location', 'Airport', 'Status', 'Health', 'Last Heartbeat', ...(isAdmin ? ['Actions'] : [])].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={isAdmin ? 8 : 7} className="p-4"><div className="skeleton h-8 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    No servers found
                  </td>
                </tr>
              ) : (
                filtered.map(server => {
                  const statusColors = getStatusColor(server.status);
                  return (
                    <tr
                      key={server.id}
                      className="hover:bg-[var(--bg-hover)] transition-colors"
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" style={{ color: statusColors.dot }} />
                          {server.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {server.ip_address}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-[200px] truncate" style={{ color: 'var(--text-secondary)' }}>
                        {server.location_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-500/10 text-primary-500">
                          {server.airport_code || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-xs font-medium`}>
                          <span className={`status-dot ${server.status}`} style={{ background: statusColors.dot }} />
                          <span style={{ color: statusColors.dot }}>{server.status?.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${server.health_score}%`,
                                background: server.health_score > 70 ? '#10B981' : server.health_score > 40 ? '#F59E0B' : '#EF4444',
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                            {server.health_score}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(server.last_heartbeat)}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditServer(server); setShowForm(true); }}
                              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(server.id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
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
      </div>

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
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="glass-card p-6 w-full max-w-lg fade-in" style={{ background: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit Server' : 'Add New Server'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--bg-hover)]">
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { key: 'name', label: 'Server Name', placeholder: 'VNS-ATC-PRIME' },
            { key: 'ip_address', label: 'IP Address', placeholder: '10.10.1.1' },
            { key: 'latitude', label: 'Latitude', placeholder: '25.4520', type: 'number' },
            { key: 'longitude', label: 'Longitude', placeholder: '82.8590', type: 'number' },
            { key: 'location_name', label: 'Location', placeholder: 'Varanasi Airport - ATC Tower' },
            { key: 'airport_code', label: 'Airport Code', placeholder: 'VNS' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input
                type={type || 'text'}
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
                step={type === 'number' ? 'any' : undefined}
                required={key !== 'airport_code'}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors focus:border-primary-500"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Server description..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors focus:border-primary-500 resize-none"
              style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
