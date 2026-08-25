import { useState, useEffect } from 'react';
import { intakeService } from '../../services/intakeService.js';
import {
  Monitor,
  Plus,
  Power,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
} from 'lucide-react';

export default function KioskManagement() {
  const [kiosks, setKiosks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [createdToken, setCreatedToken] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kioskData, analyticsData] = await Promise.all([
        intakeService.listKiosks().catch(() => ({ data: [] })),
        intakeService.getIntakeAnalytics().catch(() => null),
      ]);
      setKiosks(kioskData.data || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load kiosk administration data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterKiosk = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      const res = await intakeService.registerKiosk({ name, location });
      setCreatedToken(res.deviceToken);
      setName('');
      setLocation('');
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to register kiosk');
    }
  };

  const handleToggleDisable = async (kiosk) => {
    const isDisabling = kiosk.status !== 'DISABLED';
    const confirm = window.confirm(`Are you sure you want to ${isDisabling ? 'disable' : 'enable'} ${kiosk.name}?`);
    if (!confirm) return;

    try {
      if (isDisabling) {
        await intakeService.disableKiosk(kiosk._id, 'Disabled by hospital administrator');
      } else {
        await intakeService.updateKiosk(kiosk._id, { status: 'ONLINE' });
      }
      await fetchData();
    } catch {
      alert('Action failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-surface-900">Kiosk & Intake Fleet Management</h1>
            <span className="badge-neutral badge text-[10px] font-bold">ADMINISTRATION</span>
          </div>
          <p className="text-surface-500 text-xs mt-0.5">
            Monitor hospital kiosk terminals, digital intake sessions, and patient throughput.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={fetchData} className="btn-secondary btn-sm flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register New Kiosk</span>
          </button>
        </div>
      </div>

      {/* ── Analytics Overview Cards ──────────────────────────── */}
      {analytics?.metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-surface-200 space-y-1.5">
            <div className="flex items-center justify-between text-surface-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Total Intake Sessions</span>
              <Activity className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-2xl font-bold text-surface-900 tabular-nums">{analytics.metrics.totalSessions}</p>
            <p className="text-xs text-success-700 font-medium">
              {analytics.metrics.completionRate}% Completion Rate
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-200 space-y-1.5">
            <div className="flex items-center justify-between text-surface-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Avg Intake Duration</span>
              <Clock className="w-4 h-4 text-warning-600" />
            </div>
            <p className="text-2xl font-bold text-surface-900 tabular-nums">
              {analytics.metrics.avgDurationMinutes} <span className="text-xs font-normal text-surface-500">mins</span>
            </p>
            <p className="text-xs text-surface-400">Average completion time</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-200 space-y-1.5">
            <div className="flex items-center justify-between text-surface-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Red Flags Detected</span>
              <AlertTriangle className="w-4 h-4 text-danger-600" />
            </div>
            <p className="text-2xl font-bold text-danger-700 tabular-nums">{analytics.metrics.redFlagsDetected}</p>
            <p className="text-xs text-danger-600 font-medium">Safety flags alerted</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-surface-200 space-y-1.5">
            <div className="flex items-center justify-between text-surface-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Doctor Verification</span>
              <CheckCircle2 className="w-4 h-4 text-success-600" />
            </div>
            <p className="text-2xl font-bold text-success-700 tabular-nums">
              {analytics.metrics.doctorVerificationRate}%
            </p>
            <p className="text-xs text-surface-400">
              {analytics.metrics.factsVerifiedByDoctor} of {analytics.metrics.totalFactsExtracted} facts verified
            </p>
          </div>
        </div>
      )}

      {/* ── Registered Kiosks Table ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-surface-200 divide-y divide-surface-100 overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h3 className="font-semibold text-surface-900 text-sm">Provisioned Kiosk Units ({kiosks.length})</h3>
          <span className="text-xs text-surface-400">Heartbeat: every 60s</span>
        </div>

        {kiosks.length === 0 ? (
          <div className="text-center py-12 text-surface-400">
            <Monitor className="w-8 h-8 text-surface-300 mx-auto mb-2" />
            <p className="font-semibold text-sm text-surface-700">No kiosks provisioned</p>
            <p className="text-xs mt-1">Click 'Register New Kiosk' to provision a hardware unit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200">
                <tr>
                  <th className="py-2.5 px-4">Kiosk Terminal</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Version</th>
                  <th className="py-2.5 px-4">Last Ping</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {kiosks.map((kiosk) => (
                  <tr key={kiosk._id} className="hover:bg-surface-50/50">
                    <td className="py-3 px-4 font-semibold text-surface-900">{kiosk.name}</td>
                    <td className="py-3 px-4 text-surface-600">{kiosk.location || 'General Reception'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge text-[10px] ${
                          kiosk.status === 'ONLINE'
                            ? 'badge-success'
                            : kiosk.status === 'DISABLED'
                            ? 'badge-danger'
                            : 'badge-neutral'
                        }`}
                      >
                        {kiosk.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-surface-400">
                      v{kiosk.softwareVersion || '1.0.0'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-surface-500 tabular-nums">
                      {kiosk.lastActiveAt ? new Date(kiosk.lastActiveAt).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleDisable(kiosk)}
                        className={`btn-sm text-xs font-semibold ${
                          kiosk.status === 'DISABLED'
                            ? 'btn-secondary text-brand-700'
                            : 'btn-ghost text-danger-600 hover:bg-danger-50'
                        }`}
                      >
                        <Power className="w-3 h-3 inline mr-1" />
                        <span>{kiosk.status === 'DISABLED' ? 'Enable' : 'Disable'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Register Modal ────────────────────────────────────── */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-surface-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border border-surface-200 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-surface-900 text-sm">Provision Kiosk Unit</h3>
                <p className="text-xs text-surface-500 mt-0.5">
                  Assign a terminal identifier and physical hospital location.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-surface-400 hover:text-surface-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createdToken ? (
              <div className="space-y-3 p-3.5 rounded-lg bg-success-50 border border-success-200">
                <p className="text-xs font-bold text-success-800 uppercase">Device Token Created:</p>
                <div className="bg-white p-2.5 rounded border font-mono text-xs break-all text-surface-800">
                  {createdToken}
                </div>
                <p className="text-[11px] text-success-700">
                  Copy this token and configure it in the kiosk hardware terminal environment.
                </p>
                <button
                  onClick={() => {
                    setCreatedToken(null);
                    setShowRegisterModal(false);
                  }}
                  className="btn-primary btn-sm w-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterKiosk} className="space-y-3">
                <div>
                  <label className="label">Kiosk Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Reception Kiosk A"
                    className="input text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="label">Location / Wing</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. OPD Wing 1, Ground Floor"
                    className="input text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn-sm">
                    Register Device
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

