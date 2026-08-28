import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { patientService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  Pill, AlertTriangle, FileText, Clock, Shield, Activity,
  Calendar, ChevronRight, Landmark, QrCode, X, Sparkles,
  HeartPulse, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from '../../utils/dateUtils.js';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Clinical encounter type labels
const encounterLabel = (type) => {
  if (type === 'INPATIENT') return 'Hospitalization';
  if (type === 'LAB') return 'Lab Visit';
  if (type === 'EMERGENCY') return 'Emergency';
  return 'Outpatient Visit';
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [showAbhaModal, setShowAbhaModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['patient-summary'],
    queryFn: patientService.getMySummary,
    staleTime: 2 * 60 * 1000,
  });

  const summary = data?.summary;
  const patient = data?.patient;

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Greeting ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">
              {greeting()}, {user?.firstName}
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">Here is your health overview.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Link to="/patient/consents" className="btn-secondary btn-sm">
              <Shield className="w-3.5 h-3.5" />
              Consents
            </Link>
            <Link to="/patient/timeline" className="btn-primary btn-sm">
              <Clock className="w-3.5 h-3.5" />
              Timeline
            </Link>
          </div>
        </div>

        {/* ── Patient profile strip ──────────────────────────────── */}
        {patient && (
          <div className="bg-white border border-surface-200 rounded-xl px-5 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-surface-100">
              <div className="pr-4">
                <p className="meta-label mb-1">Blood Group</p>
                <p className="text-lg font-bold text-surface-900 tabular-nums">{patient.bloodGroup || '—'}</p>
              </div>
              <div className="px-4">
                <p className="meta-label mb-1">Date of Birth</p>
                <p className="text-sm font-medium text-surface-700">{patient.dateOfBirth ? format(patient.dateOfBirth) : '—'}</p>
              </div>
              <div className="px-4">
                <p className="meta-label mb-1">Emergency Contact</p>
                <p className="text-sm font-medium text-surface-700">{patient.emergencyContact?.name || '—'}</p>
              </div>
              <div className="pl-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="meta-label">ABHA ID</p>
                  <button
                    onClick={() => setShowAbhaModal(true)}
                    className="text-[11px] text-brand-600 hover:text-brand-800 font-semibold inline-flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Card</span>
                  </button>
                </div>
                <p className="text-sm font-medium text-surface-700">{patient.abhaId || (
                  <Link to="/patient/profile" className="text-brand-600 text-xs hover:underline">Link ABHA</Link>
                )}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Allergy alert — safety critical ───────────────────── */}
        {!isLoading && summary?.allergies?.length > 0 && (
          <Link to="/patient/allergies" className="block">
            <div className="bg-warning-50 border border-warning-200 rounded-lg px-4 py-3 flex items-center gap-3 hover:bg-warning-100 transition-colors">
              <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-warning-800">
                  {summary.allergies.length} documented {summary.allergies.length === 1 ? 'allergy' : 'allergies'}
                </span>
                <span className="text-sm text-warning-700 ml-2">
                  {summary.allergies.slice(0, 3).map(a => a.display).join(', ')}
                  {summary.allergies.length > 3 && ` +${summary.allergies.length - 3} more`}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-warning-500 flex-shrink-0" />
            </div>
          </Link>
        )}

        {/* ── Stats row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)
          ) : (
            <>
              {[
                { label: 'Active Conditions', value: summary?.activeConditions?.length ?? 0, to: '/patient/records', icon: Activity },
                { label: 'Allergies', value: summary?.allergies?.length ?? 0, to: '/patient/allergies', icon: AlertTriangle },
                { label: 'Medications', value: summary?.activeMedications?.length ?? 0, to: '/patient/medications', icon: Pill },
                { label: 'Recent Encounters', value: summary?.recentEncounters?.length ?? 0, to: '/patient/timeline', icon: Clock },
              ].map(({ label, value, to, icon: Icon }) => (
                <Link key={to} to={to} className="bg-white border border-surface-200 rounded-xl p-4 hover:border-surface-300 transition-colors group">
                  <p className="text-2xl font-bold text-surface-900 tabular-nums">{value}</p>
                  <p className="text-xs text-surface-500 mt-1 font-medium">{label}</p>
                </Link>
              ))}
            </>
          )}
        </div>

        {/* ── Main content grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Recent encounters */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-100">
                <h2 className="text-sm font-semibold text-surface-900">Recent Clinical Encounters</h2>
                <Link to="/patient/timeline" className="text-xs text-brand-600 font-medium hover:text-brand-700">
                  View all
                </Link>
              </div>

              {isLoading ? (
                <div className="p-5 space-y-3">
                  {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
                </div>
              ) : summary?.recentEncounters?.length ? (
                <div className="divide-y divide-surface-100">
                  {summary.recentEncounters.slice(0, 5).map((enc) => (
                    <div key={enc._id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900">{encounterLabel(enc.type)}</p>
                        <p className="text-xs text-surface-500 mt-0.5">{enc.organizationId?.name || 'Unknown facility'}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-surface-400">{format(enc.startDate)}</span>
                        <span className={`badge ${
                          enc.type === 'INPATIENT' ? 'badge-brand' :
                          enc.type === 'LAB' ? 'badge-info' : 'badge-neutral'
                        }`}>{enc.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Calendar className="w-7 h-7 mx-auto text-surface-300 mb-2" />
                  <p className="text-sm text-surface-500">No encounters recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: conditions + quick links */}
          <div className="space-y-4">
            {/* Active conditions */}
            <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">Active Conditions</h3>
                <Link to="/patient/records" className="text-xs text-brand-600 hover:text-brand-700">View</Link>
              </div>
              <div className="px-4 py-3">
                {isLoading ? (
                  <div className="skeleton h-16 w-full" />
                ) : summary?.activeConditions?.length ? (
                  <ul className="space-y-2">
                    {summary.activeConditions.map((c) => (
                      <li key={c._id} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-surface-400 flex-shrink-0" />
                        <span className="text-surface-700">{c.display}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-surface-400">No active conditions</p>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900">Quick Access</h3>
              </div>
              <div className="divide-y divide-surface-100">
                <Link to="/patient/schemes" className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors group text-sm text-surface-700">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-brand-600" />
                    Govt. Health Schemes
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
                </Link>
                <Link to="/patient/consents" className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors group text-sm text-surface-700">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-surface-400" />
                    Manage Consents
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
                </Link>
                <Link to="/patient/records" className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors group text-sm text-surface-700">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-surface-400" />
                    Medical Records
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
                </Link>
                <Link to="/patient/access-history" className="flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors group text-sm text-surface-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-surface-400" />
                    Access History
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* ── ABHA Digital Card & QR "Scan & Share" Modal ───────── */}
        {showAbhaModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-surface-200 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-fade-in">
              {/* Card Header Bar */}
              <div className="p-4 bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
                    <HeartPulse className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">National Digital Health Card</p>
                    <p className="text-[10px] text-brand-200">Ayushman Bharat (ABDM)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAbhaModal(false)}
                  className="p-1 rounded text-white/70 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Digital Card Body */}
              <div className="p-5 space-y-4 text-center">
                {/* Simulated QR Code */}
                <div className="bg-surface-50 border-2 border-dashed border-brand-300 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="w-36 h-36 bg-white border border-surface-200 rounded-lg p-2 flex flex-col items-center justify-center shadow-inner">
                    <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-80">
                      {[...Array(36)].map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs ${
                            (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                              ? 'bg-slate-900'
                              : i % 5 === 0
                              ? 'bg-brand-600'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan & Share at OPD Kiosk</span>
                  </div>
                </div>

                {/* Patient Identity */}
                <div className="text-left space-y-1.5 border-t border-surface-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-surface-400">Name:</span>
                    <span className="font-bold text-surface-900">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">ABHA Number:</span>
                    <span className="font-mono font-bold text-brand-700">{patient?.abhaId || '91-4820-1923-8841'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">ABHA Address:</span>
                    <span className="font-mono text-surface-700">{(user?.firstName || 'arjun').toLowerCase()}.{(user?.lastName || 'kumar').toLowerCase()}@abdm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-400">Blood Group:</span>
                    <span className="font-bold text-surface-900">{patient?.bloodGroup || 'O+'}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <Link
                    to="/kiosk"
                    className="btn-primary w-full btn-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Simulate OPD Check-In with this Card</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

