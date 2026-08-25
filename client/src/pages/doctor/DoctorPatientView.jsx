import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { recordsService } from '../../services/healthbridge.js';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import {
  ArrowLeft, User, Heart, Zap, Pill, Activity, FlaskConical,
  Scissors, Scan, Clock, AlertTriangle, Shield,
} from 'lucide-react';
import { format } from '../../utils/dateUtils.js';

const Section = ({ title, icon: Icon, children, empty }) => (
  <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-100">
      <Icon className="w-4 h-4 text-surface-500" />
      <h3 className="text-sm font-semibold text-surface-900">{title}</h3>
    </div>
    <div className="p-5">
      {children || (
        <p className="text-sm text-surface-400">{empty || 'No data available in authorized scope.'}</p>
      )}
    </div>
  </div>
);

export default function DoctorPatientView() {
  const { patientId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['doctor-patient-view', patientId],
    queryFn: () => recordsService.getDoctorPatientView(patientId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <DoctorLayout>
        <div className="max-w-5xl mx-auto space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 w-full" />)}
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <div className="max-w-2xl mx-auto">
          <div className="alert-danger">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Access denied</p>
              <p className="text-sm mt-0.5">
                {error.response?.data?.error?.message ||
                  'You do not have an active approved consent to view this patient\'s records.'}
              </p>
            </div>
          </div>
          <Link to="/doctor/dashboard" className="btn-secondary mt-4 inline-flex">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
        </div>
      </DoctorLayout>
    );
  }

  const { patient, records = {}, consentScope = [] } = data || {};
  const patientUser = patient?.userId || {};

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <Link to="/doctor/patients" className="btn-ghost btn-sm inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Back to patients
        </Link>

        {/* Patient header — clean clinical identity strip */}
        <div className="bg-white border border-surface-200 rounded-xl px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-700 font-bold text-sm leading-none">
                  {patientUser.firstName?.[0]}{patientUser.lastName?.[0]}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-surface-900">
                  {patientUser.firstName} {patientUser.lastName}
                </h1>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-surface-500">
                  {patient?.dateOfBirth && <span>DOB: {format(patient.dateOfBirth)}</span>}
                  {patient?.gender && <span className="capitalize">{patient.gender}</span>}
                  {patient?.bloodGroup && (
                    <span className="font-semibold text-surface-700">Blood: {patient.bloodGroup}</span>
                  )}
                  {patient?.emergencyContact?.name && (
                    <span>Emergency: {patient.emergencyContact.name} ({patient.emergencyContact.phone})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-success-700 bg-success-50 border border-success-200 rounded-lg px-2.5 py-1.5 flex-shrink-0">
              <Shield className="w-3.5 h-3.5" />
              Authorized
            </div>
          </div>
          {consentScope.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-100 flex items-center gap-2 flex-wrap">
              <span className="meta-label">Scope:</span>
              {consentScope.map((s) => (
                <span key={s} className="badge-neutral badge text-[10px]">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Allergies — always shown first (critical safety) */}
        {records.allergies && (
          <div className="bg-warning-50 border border-warning-200 border-l-4 border-l-warning-500 rounded-r-lg overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-warning-200/60">
              <AlertTriangle className="w-4 h-4 text-warning-600" />
              <h3 className="text-sm font-semibold text-warning-800">Allergies — Clinical Safety</h3>
              <span className="badge-warning badge ml-auto">{records.allergies.length} documented</span>
            </div>
            <div className="p-5">
              {records.allergies.length === 0 ? (
                <p className="text-sm text-warning-700">No allergies documented</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {records.allergies.map((a) => (
                    <div key={a._id} className="p-3 rounded-lg bg-white border border-warning-200">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-surface-900 text-sm">{a.display}</p>
                        <span className={`badge ${
                          a.criticality === 'high' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {a.criticality}
                        </span>
                      </div>
                      {a.reaction?.[0] && (
                        <p className="text-xs text-surface-600 mt-1">{a.reaction[0].description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conditions */}
        {records.conditions && (
          <Section title="Active Conditions" icon={Activity} color="brand">
            {records.conditions.length === 0 ? (
              <p className="text-sm text-surface-400">No conditions documented</p>
            ) : (
              <div className="space-y-2">
                {records.conditions.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <div>
                      <p className="font-medium text-surface-900 text-sm">{c.display}</p>
                      {c.onsetDate && <p className="text-xs text-surface-400">Since {format(c.onsetDate)}</p>}
                    </div>
                    <div className="flex gap-2">
                      <span className={`badge status-${c.clinicalStatus}`}>{c.clinicalStatus}</span>
                      {c.severity && <span className="badge badge-neutral">{c.severity}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Medications */}
        {records.medications && (
          <Section title="Medications" icon={Pill} color="success">
            {records.medications.length === 0 ? (
              <p className="text-sm text-surface-400">No medications documented</p>
            ) : (
              <div className="space-y-2">
                {records.medications.map((m) => (
                  <div key={m._id} className="flex items-start justify-between p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <div>
                      <p className="font-medium text-surface-900 text-sm">{m.medicationDisplay}</p>
                      {m.dosage?.text && <p className="text-xs text-surface-500 mt-0.5">{m.dosage.text}</p>}
                      {m.frequency && <p className="text-xs text-surface-400">{m.frequency}</p>}
                    </div>
                    <span className={`badge status-${m.status}`}>{m.status}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Procedures */}
        {records.procedures && (
          <Section title="Procedures & Surgeries" icon={Scissors} color="danger">
            {records.procedures.length === 0 ? (
              <p className="text-sm text-surface-400">No procedures documented</p>
            ) : (
              <div className="space-y-2">
                {records.procedures.map((p) => (
                  <div key={p._id} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-surface-900 text-sm">{p.display}</p>
                      <div className="flex gap-2">
                        {p.isSurgery && <span className="badge badge-danger">Surgery</span>}
                        <span className="badge badge-neutral">{format(p.performedDate)}</span>
                      </div>
                    </div>
                    {p.outcome && <p className="text-xs text-surface-500 mt-1">{p.outcome}</p>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Diagnostic reports */}
        {records.diagnosticReports && (
          <Section title="Diagnostic Reports" icon={FlaskConical} color="info">
            {records.diagnosticReports.length === 0 ? (
              <p className="text-sm text-surface-400">No reports available</p>
            ) : (
              <div className="space-y-2">
                {records.diagnosticReports.map((r) => (
                  <div key={r._id} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-surface-900 text-sm">{r.display}</p>
                      <span className="text-xs text-surface-400">{format(r.effectiveDate)}</span>
                    </div>
                    {r.conclusion && (
                      <p className="text-xs text-surface-600 mt-1 italic">{r.conclusion}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Encounters */}
        {records.encounters && (
          <Section title="Clinical Encounters" icon={Clock} color="neutral">
            {records.encounters.length === 0 ? (
              <p className="text-sm text-surface-400">No encounters documented</p>
            ) : (
              <div className="space-y-2">
                {records.encounters.map((e) => (
                  <div key={e._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-100">
                    <div>
                      <p className="font-medium text-surface-900 text-sm">{e.type}</p>
                      {e.chiefComplaint && <p className="text-xs text-surface-500 mt-0.5">{e.chiefComplaint}</p>}
                    </div>
                    <span className="text-xs text-surface-400">{format(e.startDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Security footer */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 border border-surface-100 text-sm text-surface-500">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-500" />
          <p>
            This access is covered by an active patient consent. Only records within the approved scope are shown.
            Your access has been logged in the audit trail and is visible to the patient.
          </p>
        </div>
      </div>
    </DoctorLayout>
  );
}
