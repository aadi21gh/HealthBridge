import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/healthbridge.js';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const ROLES = [
  { value: 'PATIENT', label: 'Patient', desc: 'Manage your own health records securely' },
  { value: 'DOCTOR', label: 'Doctor / Clinician', desc: 'Access authorized patient records' },
  { value: 'HOSPITAL_ADMIN', label: 'Hospital Admin', desc: 'Manage your organization and kiosks' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'PATIENT', phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register(form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const details = err.response?.data?.error?.details;
      if (details?.length) {
        setError(details.map((d) => d.message).join(' · '));
      } else {
        setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-surface-900">Account created</h2>
          <p className="text-surface-500 mt-2 text-sm">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* ── Left Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[40%] bg-white border-r border-surface-200 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.5.5 0 0 1 .5.5v5.5H14a.5.5 0 0 1 0 1H8.5V14a.5.5 0 0 1-1 0V8.5H2a.5.5 0 0 1 0-1h5.5V2a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </div>
            <span className="font-bold text-surface-900 text-lg tracking-tight">HealthBridge</span>
          </div>

          <div className="mt-16">
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">
              Get started today
            </p>
            <h1 className="text-3xl font-bold text-surface-900 leading-snug">
              Join India's unified<br />health record platform.
            </h1>
            <p className="text-surface-500 mt-4 leading-relaxed text-sm">
              Create your account to securely access and manage health records, consents, and clinical data.
            </p>
          </div>
        </div>

        <p className="text-xs text-surface-400">
          HealthBridge · ABDM certified · Secure Health Records
        </p>
      </div>

      {/* ── Right Panel — Registration form ───────────────── */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-sm py-4">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.5.5 0 0 1 .5.5v5.5H14a.5.5 0 0 1 0 1H8.5V14a.5.5 0 0 1-1 0V8.5H2a.5.5 0 0 1 0-1h5.5V2a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </div>
            <span className="font-bold text-surface-900">HealthBridge</span>
          </div>

          <h2 className="text-2xl font-bold text-surface-900">Create account</h2>
          <p className="text-surface-500 text-sm mt-1">Fill in your details to get started.</p>

          {error && (
            <div className="alert-danger mt-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Role selector */}
            <div>
              <p className="label">I am a…</p>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.role === r.value
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-surface-200 hover:border-surface-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="mt-0.5 accent-brand-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-surface-900">{r.label}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">First name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="input"
                  placeholder="Arjun"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Last name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="input"
                  placeholder="Kumar"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Phone <span className="text-surface-400 font-normal">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="Min. 8 chars, upper + lower + number"
                required
                minLength={8}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5" id="register-submit">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
