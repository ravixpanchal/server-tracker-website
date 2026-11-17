import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <main className="mx-auto grid min-h-dvh max-w-7xl content-center gap-5 p-4 sm:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
      <section className="aviation-hero flex min-h-48 flex-col justify-between gap-8 rounded-3xl p-6 sm:p-10 lg:p-12">
        <div className="relative grid size-12 place-items-center rounded-xl border border-white/30 bg-white/15">
          <Plane aria-hidden="true" className="size-6" />
        </div>
        <div className="relative">
          <p className="mb-3 text-sm font-semibold text-blue-100">Airports Authority of India</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">AAI Server Tracker</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-blue-100 sm:text-base">
            Monitor airport infrastructure and track live alerts across India.
          </p>
        </div>
        <p className="relative hidden text-xs text-blue-100 lg:block">© 2026 Ravi Panchal</p>
      </section>

      <section className="glass-panel rounded-3xl p-5 sm:p-10 lg:p-12" aria-labelledby="sign-in-heading">
        <h2 id="sign-in-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">Sign in</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Access the monitoring dashboard.</p>

        {error && (
          <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle aria-hidden="true" className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold">Username</label>
            <input id="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)}
              required className="min-h-12 w-full rounded-xl border border-[var(--border-color)] px-4 text-base" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label>
            <div className="relative">
              <input id="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)} required
                className="min-h-12 w-full rounded-xl border border-[var(--border-color)] px-4 pr-14 text-base" />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-1 grid w-11 cursor-pointer place-items-center rounded-lg text-primary-600">
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="min-h-12 w-full cursor-pointer rounded-xl bg-primary-500 px-4 font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-[var(--bg-tint)] p-4 text-sm">
          <p className="mb-2 font-semibold text-primary-700">Demo credentials</p>
          <p className="text-[var(--text-secondary)]">Admin <code className="ml-2">admin / admin123</code></p>
          <p className="mt-1 text-[var(--text-secondary)]">Operator <code className="ml-2">operator / operator123</code></p>
        </div>
      </section>
      <p className="text-center text-xs text-[var(--text-secondary)] lg:hidden">© 2026 Ravi Panchal</p>
    </main>
  );
}
