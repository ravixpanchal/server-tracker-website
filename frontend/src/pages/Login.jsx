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
    <div className="min-h-screen flex relative bg-slate-950 lg:bg-[#f8fafc] text-slate-900">
      
      {/* Mobile background decor */}
      <div className="absolute inset-0 opacity-20 lg:hidden pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-indigo-600 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-violet-600 blur-3xl" />
      </div>

      {/* Left: Aviation illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-20 left-20 w-80 h-80 rounded-full bg-indigo-500 blur-3xl animate-pulse" />
          <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full bg-violet-600 blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-12">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-violet-600/30 flex items-center justify-center mx-auto mb-8 backdrop-blur-xl border border-indigo-400/30 shadow-2xl shadow-indigo-500/20">
            <Plane className="w-12 h-12 text-indigo-200" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 mb-4 tracking-tight">
            AAI Server Tracker
          </h1>
          <p className="text-base text-indigo-200/80 max-w-md mx-auto leading-relaxed">
            AI-powered aviation infrastructure monitoring system for Airports Authority of India
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            {['16+ Servers', 'Real-time AI', 'Pan India'].map(item => (
              <div key={item} className="text-center px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 backdrop-blur-md shadow-lg">
                <p className="text-xs font-semibold text-indigo-200 tracking-wide">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-6 left-0 w-full text-center z-10">
          <p className="text-xs text-indigo-300/60 font-medium tracking-wide">Made with ❤️ by Ravi Panchal. All Rights Reserved @2026</p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10 bg-slate-950 lg:bg-[#f8fafc]">
        <div 
          className="w-full max-w-md p-6 sm:p-10 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none bg-slate-900/90 lg:bg-transparent border border-indigo-500/20 lg:border-none backdrop-blur-xl lg:backdrop-blur-none"
        >
          {/* Mobile logo header */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/40">
              <Plane className="w-8 h-8 text-white stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-bold text-white">AAI Server Tracker</h1>
            <p className="text-xs text-indigo-200/70 mt-2 px-2 leading-relaxed">
              AI-powered aviation infrastructure monitoring system for Airports Authority of India
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              {['16+ Servers', 'Real-time AI', 'Pan India'].map(item => (
                <div key={item} className="text-center px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40">
                  <p className="text-[10px] font-semibold text-indigo-300 tracking-wide uppercase">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-600">
              Sign in to access the monitoring dashboard
            </p>
          </div>

          <div className="mb-8 lg:hidden text-center">
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-xs text-indigo-200/70 mt-1">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 fade-in">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 lg:text-slate-700 mb-1.5 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-700 lg:border-slate-300 text-sm outline-none transition-all bg-slate-800/80 lg:bg-white text-slate-100 lg:text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 lg:text-slate-700 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-700 lg:border-slate-300 text-sm outline-none transition-all bg-slate-800/80 lg:bg-white text-slate-100 lg:text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-300 lg:hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-3 mt-4 sm:mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
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

          <div className="mt-8 p-4 rounded-xl text-center lg:text-left bg-slate-800/50 lg:bg-indigo-50/70 border border-slate-700 lg:border-indigo-100">
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-indigo-400 lg:text-indigo-900">Demo Credentials</p>
            <div className="space-y-1.5 text-xs flex flex-col lg:items-start items-center text-slate-300 lg:text-slate-700 font-mono">
              <p><strong className="font-sans text-slate-200 lg:text-slate-900">Admin:</strong> admin / admin123</p>
              <p><strong className="font-sans text-slate-200 lg:text-slate-900">Operator:</strong> operator / operator123</p>
            </div>
          </div>

          {/* Mobile footer */}
          <div className="lg:hidden mt-8 text-center pb-4">
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 tracking-wide">
              Made with ❤️ by Ravi Panchal.<br className="sm:hidden" /> All Rights Reserved @2026
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
