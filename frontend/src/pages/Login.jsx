import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Plane, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      if (err.message === 'Network Error') {
        setError('Network error. Is the backend server running? (If on Render free tier, it might be waking up... please wait 1 min and try again)');
      } else if (err.response?.status === 404) {
        setError('API Endpoint not found (404). Did you set VITE_API_URL on Render?');
      } else if (err.response?.status >= 500) {
        setError('Server is down or waking up. Please try again in a minute.');
      } else {
        setError(err.response?.data?.detail || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative bg-primary-500 lg:bg-[var(--bg-primary)]">
      
      {/* Mobile background decor */}
      <div className="absolute inset-0 opacity-10 lg:hidden pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-accent-500 blur-3xl" />
      </div>

      {/* Left: Aviation illustration */}
      <div className="hidden lg:flex flex-1 bg-primary-500 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-accent-500 blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center mx-auto mb-8 backdrop-blur-lg">
            <Plane className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            AAI Server Tracker
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            AI-powered aviation infrastructure monitoring system for Airports Authority of India
          </p>
          <div className="flex items-center justify-center gap-6 mt-12">
            {['16+ Servers', 'Real-time AI', 'Pan India'].map(item => (
              <div key={item} className="text-center">
                <p className="text-sm font-medium text-white/90">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-0 w-full text-center z-10">
          <p className="text-xs text-white font-bold tracking-wide">Made with ❤️ by Ravi Panchal. All Rights Reserved @2026</p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div 
          className="w-full max-w-md p-6 sm:p-10 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none bg-[var(--bg-card)] lg:bg-transparent"
        >
          {/* Mobile logo header */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary-400 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/20">
              <Plane className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>AAI Server Tracker</h1>
            <p className="text-xs mt-2 px-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              AI-powered aviation infrastructure monitoring system for Airports Authority of India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              {['16+ Servers', 'Real-time AI', 'Pan India'].map(item => (
                <div key={item} className="text-center px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800" style={{ background: 'var(--bg-primary)' }}>
                  <p className="text-[10px] font-semibold tracking-wide uppercase" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to access the monitoring dashboard
            </p>
          </div>

          <div className="mb-8 lg:hidden text-center">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center gap-3 fade-in">
              <AlertCircle className="w-5 h-5 text-danger-500 shrink-0" />
              <p className="text-sm text-danger-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  style={{ background: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-500/10 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-3 mt-4 sm:mt-2 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="mt-8 p-4 rounded-xl text-center lg:text-left" style={{ background: 'var(--bg-hover)' }}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Demo Credentials</p>
            <div className="space-y-1.5 text-xs flex flex-col lg:items-start items-center" style={{ color: 'var(--text-muted)' }}>
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Operator:</strong> operator / operator123</p>
            </div>
          </div>

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center pb-4">
            <p className="text-[10px] sm:text-xs font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Made with ❤️ by Ravi Panchal.<br className="sm:hidden" /> All Rights Reserved @2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
