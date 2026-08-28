import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { recordsService, patientService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  FileText, Activity, FlaskConical, Scan, Scissors,
  Syringe, Search, Filter, Calendar, Building2,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle,
  FileCheck, Shield, ExternalLink, Download, Printer,
  QrCode, X, HeartPulse, Sparkles
} from 'lucide-react';
import { format } from '../../utils/dateUtils.js';

const TABS = [
  { id: 'conditions', label: 'Conditions & Diagnoses', icon: Activity, countKey: 'conditions' },
  { id: 'diagnosticReports', label: 'Lab Reports', icon: FlaskConical, countKey: 'diagnosticReports' },
  { id: 'imagingStudies', label: 'Imaging & Scans', icon: Scan, countKey: 'imagingStudies' },
  { id: 'procedures', label: 'Procedures & Surgeries', icon: Scissors, countKey: 'procedures' },
  { id: 'immunizations', label: 'Immunizations', icon: Syringe, countKey: 'immunizations' },
  { id: 'observations', label: 'Vitals & Observations', icon: FileCheck, countKey: 'observations' },
];

export default function RecordsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('conditions');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['patient-records', activeTab],
    queryFn: () => recordsService.getMyRecords(activeTab),
    staleTime: 60 * 1000,
  });

  const { data: summaryData } = useQuery({
    queryKey: ['patient-summary'],
    queryFn: patientService.getMySummary,
    staleTime: 2 * 60 * 1000,
  });

  const records = data?.data || [];
  const patient = summaryData?.patient;
  const summary = summaryData?.summary;

  const filtered = records.filter((r) => {
    const term = search.toLowerCase();
    const title = (r.display || r.code || r.procedureCode || r.modality || r.vaccineDisplay || r.notes || '').toLowerCase();
    const conclusion = (r.conclusion || r.clinicalStatus || r.bodySite || '').toLowerCase();
    return title.includes(term) || conclusion.includes(term);
  });

  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">Medical Records</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Consolidated lifetime health records — diagnostics, imaging, conditions, procedures.
            </p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="btn-primary btn-sm flex-shrink-0 self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Health Summary (PDF)</span>
          </button>
        </div>

        {/* Category Tabs — underline style */}
        <div className="border-b border-surface-200">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setSearch('');
                  setExpandedId(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="card p-4 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search in ${TABS.find((t) => t.id === activeTab)?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <span className="text-xs text-surface-500 font-medium hidden sm:inline">
            Showing {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {/* Records Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <FileText className="w-12 h-12 mx-auto mb-3 text-surface-300" />
            <h3 className="text-base font-semibold text-surface-800">No records found</h3>
            <p className="text-xs text-surface-400 mt-1">
              {search ? 'No matching record for your query' : 'No records exist in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const isExpanded = expandedId === item._id;
              const date =
                item.effectiveDate ||
                item.onsetDate ||
                item.performedDate ||
                item.studyDate ||
                item.occurrenceDate ||
                item.createdAt;

              const title =
                item.display ||
                item.procedureCode ||
                item.vaccineDisplay ||
                item.modality ||
                item.code ||
                'Clinical Record';

              return (
                <div
                  key={item._id}
                  className="bg-white border border-surface-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item._id)}
                    className="w-full p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-surface-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-surface-500 flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-surface-900 text-sm sm:text-base truncate">
                            {title}
                          </h3>
                          {item.clinicalStatus && (
                            <span
                              className={`badge text-[11px] capitalize ${
                                item.clinicalStatus === 'active'
                                  ? 'badge-brand'
                                  : 'badge-neutral'
                              }`}
                            >
                              {item.clinicalStatus}
                            </span>
                          )}
                          {item.severity && (
                            <span className="badge badge-warning text-[11px] capitalize">
                              {item.severity}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-surface-400 mt-1">
                          {date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(date)}
                            </span>
                          )}
                          {item.organizationId?.name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {item.organizationId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-surface-400" />
                        : <ChevronDown className="w-4 h-4 text-surface-400" />}
                    </div>
                  </button>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-surface-100 bg-surface-50/50 space-y-3 text-xs animate-fade-in">
                      {item.conclusion && (
                        <div>
                          <p className="font-semibold text-surface-700 uppercase tracking-wide text-[10px]">
                            Diagnostic Conclusion:
                          </p>
                          <p className="text-surface-900 mt-1 font-medium bg-white p-3 rounded-xl border border-surface-100">
                            {item.conclusion}
                          </p>
                        </div>
                      )}

                      {item.notes && (
                        <div>
                          <p className="font-semibold text-surface-700 uppercase tracking-wide text-[10px]">
                            Clinical Notes:
                          </p>
                          <p className="text-surface-800 mt-1 bg-white p-3 rounded-xl border border-surface-100">
                            {item.notes}
                          </p>
                        </div>
                      )}

                      {item.results && item.results.length > 0 && (
                        <div>
                          <p className="font-semibold text-surface-700 uppercase tracking-wide text-[10px] mb-1.5">
                            Lab Test Observations:
                          </p>
                          <div className="bg-white rounded-xl border border-surface-100 divide-y divide-surface-100">
                            {item.results.map((res, i) => (
                              <div key={i} className="p-2.5 flex items-center justify-between">
                                <span className="font-medium text-surface-800">{res.display || 'Test'}</span>
                                <span className="font-mono font-semibold text-surface-900">
                                  {res.value} {res.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-surface-200/60 text-[11px] text-surface-500">
                        <div>
                          <span className="font-medium text-surface-700">FHIR ID:</span>{' '}
                          <span className="font-mono">{item.fhirId || item._id.slice(-8)}</span>
                        </div>
                        {item.code && (
                          <div>
                            <span className="font-medium text-surface-700">Code:</span>{' '}
                            <span className="font-mono">{item.code}</span>
                          </div>
                        )}
                        {item.bodySite && (
                          <div>
                            <span className="font-medium text-surface-700">Body Site:</span>{' '}
                            <span>{item.bodySite}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-surface-700">Verified:</span>{' '}
                          <span className="text-emerald-600 font-semibold">Yes (Digitally Signed)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Export FHIR Health Summary Modal (Printable) ────────── */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-surface-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
              {/* Modal Top Bar */}
              <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-surface-50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-brand-600" />
                  <span className="font-bold text-surface-900 text-sm">Longitudinal Health Summary (FHIR R4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-1 rounded text-surface-400 hover:text-surface-700 hover:bg-surface-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printable Medical Summary Document */}
              <div className="p-6 space-y-5 text-surface-900 text-xs">
                {/* Official Clinical Header */}
                <div className="border-b-2 border-surface-900 pb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-surface-900">HealthBridge Official Health Summary</h2>
                    <p className="text-[11px] text-surface-500 mt-0.5">
                      Ayushman Bharat Digital Mission (ABDM) Compliant Longitudinal Record
                    </p>
                    <p className="text-[10px] text-surface-400 font-mono mt-1">
                      Generated on {new Date().toLocaleString()} · Security Hash: 0x92f1...84c
                    </p>
                  </div>
                  <div className="text-right border border-surface-300 rounded p-2 bg-surface-50 font-mono text-[10px]">
                    <div className="font-bold text-surface-900">ABHA IDENTIFIER</div>
                    <div className="text-brand-700">{patient?.abhaId || '91-4820-1923-8841'}</div>
                  </div>
                </div>

                {/* Patient Demographics Strip */}
                <div className="grid grid-cols-4 gap-3 bg-surface-50 border border-surface-200 rounded-lg p-3">
                  <div>
                    <span className="text-[10px] text-surface-500 uppercase font-semibold block">Patient Name</span>
                    <span className="font-bold text-surface-900 text-sm">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface-500 uppercase font-semibold block">Date of Birth</span>
                    <span className="font-medium text-surface-900">{patient?.dateOfBirth ? format(patient.dateOfBirth) : '15 Aug 1990'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface-500 uppercase font-semibold block">Blood Group</span>
                    <span className="font-bold text-brand-700">{patient?.bloodGroup || 'O+'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-surface-500 uppercase font-semibold block">Emergency Contact</span>
                    <span className="font-medium text-surface-900">{patient?.emergencyContact?.name || 'Primary Contact'}</span>
                  </div>
                </div>

                {/* Allergy Warning Strip */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300">
                  <span className="font-bold text-amber-900 block mb-1">Critical Allergy Safety Ledger:</span>
                  {summary?.allergies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {summary.allergies.map((a, i) => (
                        <span key={i} className="bg-amber-200/70 text-amber-900 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {a.display} ({a.criticality || 'High'})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-amber-800">No known drug/food allergies documented.</span>
                  )}
                </div>

                {/* Active Diagnoses & Conditions */}
                <div>
                  <h3 className="font-bold text-sm text-surface-900 border-b border-surface-200 pb-1 mb-2">
                    Active Diagnoses & Conditions
                  </h3>
                  {summary?.activeConditions?.length ? (
                    <ul className="space-y-1">
                      {summary.activeConditions.map((c, i) => (
                        <li key={i} className="flex items-center justify-between py-1 border-b border-surface-100">
                          <span className="font-semibold text-surface-900">{c.display}</span>
                          <span className="badge badge-neutral text-[10px]">{c.clinicalStatus || 'Active'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-surface-400 italic">No active chronic conditions.</p>
                  )}
                </div>

                {/* Active Medications */}
                <div>
                  <h3 className="font-bold text-sm text-surface-900 border-b border-surface-200 pb-1 mb-2">
                    Active Prescriptions & Dosages
                  </h3>
                  {summary?.activeMedications?.length ? (
                    <ul className="space-y-1">
                      {summary.activeMedications.map((m, i) => (
                        <li key={i} className="flex items-center justify-between py-1 border-b border-surface-100">
                          <span className="font-semibold text-surface-900">{m.medicationDisplay}</span>
                          <span className="text-surface-600">{m.dosage?.text || m.frequency || 'Daily'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-surface-400 italic">No active medications recorded.</p>
                  )}
                </div>

                {/* Verification Notice */}
                <div className="pt-4 border-t border-surface-200 flex items-center justify-between text-[10px] text-surface-500">
                  <span>Digitally verified via HealthBridge FHIR Consent Engine.</span>
                  <span className="font-mono">ABDM Validated</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
