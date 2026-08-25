import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const getRoleRedirect = (role) => {
    const map = {
      PATIENT: '/patient/dashboard',
      DOCTOR: '/doctor/dashboard',
      HOSPITAL_ADMIN: '/hospital/dashboard',
      SYSTEM_ADMIN: '/admin/dashboard',
    };
    return map[role] || '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form.email, form.password);
      const redirect = from || getRoleRedirect(data.user.role);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setForm({ email, password });
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      const redirect = from || getRoleRedirect(data.user.role);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* ── Left Panel — Product context ───────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-white border-r border-surface-200 flex-col justify-between p-12">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.5.5 0 0 1 .5.5v5.5H14a.5.5 0 0 1 0 1H8.5V14a.5.5 0 0 1-1 0V8.5H2a.5.5 0 0 1 0-1h5.5V2a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </div>
            <span className="font-bold text-surface-900 text-lg tracking-tight">HealthBridge</span>
          </div>

          {/* Positioning */}
          <div className="mt-16">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">
              India's Unified Health Record Platform
            </p>
            <h1 className="text-3xl font-bold text-surface-900 leading-snug">
              Your complete medical history,<br />always with you.
            </h1>
            <p className="text-surface-500 mt-4 leading-relaxed">
              HealthBridge gives patients, doctors and healthcare providers a single trusted view of clinical records — secured by ABDM and built for India.
            </p>
          </div>

          {/* Trust markers */}
          <div className="mt-12 space-y-3">
            {[
              "ABDM compliant — built on India's national health stack",
              'Patient-controlled consent for every data access',
              'End-to-end encrypted clinical record storage',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5 text-success-600" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm text-surface-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-surface-400">
          HealthBridge · ABDM certified · Secure Health Records
        </p>
      </div>

      {/* ── Right Panel — Login form ───────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.5.5 0 0 1 .5.5v5.5H14a.5.5 0 0 1 0 1H8.5V14a.5.5 0 0 1-1 0V8.5H2a.5.5 0 0 1 0-1h5.5V2a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </div>
            <span className="font-bold text-surface-900">HealthBridge</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900">Sign in</h2>
          <p className="text-surface-500 text-sm mt-1">Enter your credentials to access your account.</p>

          {error && (
            <div className="alert-danger mt-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="form-group">
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
              id="login-submit"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Create account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 border border-surface-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-surface-50 border-b border-surface-200 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-surface-600 uppercase tracking-wider">Demo Accounts</p>
              <span className="text-[10px] text-surface-400 font-mono">Password: Demo@1234</span>
            </div>
            <div className="divide-y divide-surface-100">
              {[
                { label: 'Patient', name: 'Arjun Kumar', email: 'arjun.kumar@example.com' },
                { label: 'Doctor', name: 'Dr. Sharma (Surgery)', email: 'dr.sharma@apollodemo.example' },
                { label: 'Admin', name: 'System Admin', email: 'admin@healthbridge.example' },
              ].map(({ label, name, email }) => (
                <button
                  key={email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(email, 'Demo@1234')}
                  className="w-full text-left px-4 py-2.5 hover:bg-surface-50 transition-colors flex items-center justify-between group disabled:opacity-50"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-surface-800">{label}</span>
                      <span className="text-[11px] text-surface-400">· {name}</span>
                    </div>
                    <p className="text-[11px] text-surface-500 font-mono">{email}</p>
                  </div>
                  <span className="text-xs text-brand-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Sign In →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

