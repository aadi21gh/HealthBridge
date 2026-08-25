import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import { intakeService } from '../../services/intakeService.js';
import {
  Stethoscope,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  FileText,
  ArrowRight,
  Check,
  X,
  ExternalLink,
  Leaf,
} from 'lucide-react';

export default function DoctorIntakeView() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFactId, setEditingFactId] = useState(null);
  const [editedConcept, setEditedConcept] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [finalizing, setFinalizing] = useState(false);
  const [finalizedResult, setFinalizedResult] = useState(null);

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      const data = await intakeService.getDoctorBriefing(sessionId);
      setBriefing(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load intake briefing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchBriefing();
  }, [sessionId]);

  const handleVerifyFact = async (factId, action, extra = {}) => {
    try {
      await intakeService.verifyFact(factId, {
        action,
        editedConcept: extra.editedConcept,
        doctorNotes: extra.doctorNotes,
      });
      setEditingFactId(null);
      await fetchBriefing();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Verification action failed');
    }
  };

  const handleFinalizeIntake = async () => {
    setFinalizing(true);
    try {
      const result = await intakeService.finalizeAndPromote(sessionId);
      setFinalizedResult(result);
      await fetchBriefing();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Finalization failed');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-xs text-surface-500 font-medium">Loading Clinical Intake Briefing...</p>
        </div>
      </DoctorLayout>
    );
  }

  if (error || !briefing) {
    return (
      <DoctorLayout>
        <div className="p-8 text-center bg-white rounded-xl border border-surface-200 max-w-lg mx-auto">
          <AlertTriangle className="w-8 h-8 text-warning-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-surface-900">Intake Briefing Error</h3>
          <p className="text-surface-500 text-xs mt-1">{error || 'Session not found'}</p>
          <button onClick={() => navigate(-1)} className="btn-secondary btn-sm mt-4">
            Go Back
          </button>
        </div>
      </DoctorLayout>
    );
  }

  const { session, patient, facts, categorizedFacts, redFlags, documents, ayushData, summary } = briefing;

  return (
    <DoctorLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* ── Top Header & Patient Bar ─────────────────────────── */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-base flex-shrink-0">
              {patient?.userId?.firstName?.[0]}
              {patient?.userId?.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-surface-900">
                  {patient?.userId?.firstName} {patient?.userId?.lastName || 'Walk-in Patient'}
                </h1>
                <span className="badge-neutral badge text-[10px]">
                  {session.discipline.replace(/_/g, ' ')}
                </span>
                {session.doctorVerification?.status === 'VERIFIED' && (
                  <span className="badge badge-success text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Doctor Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                Gender: <span className="capitalize">{patient?.gender || 'N/A'}</span> • Blood: {patient?.bloodGroup || 'N/A'} • Intake Date:{' '}
                {new Date(session.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {session.doctorVerification?.status !== 'VERIFIED' ? (
              <button
                onClick={handleFinalizeIntake}
                disabled={finalizing}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{finalizing ? 'Integrating...' : 'Verify & Promote to Medical Record'}</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(`/doctor/patients/${patient?._id}`)}
                className="btn-primary btn-sm flex items-center gap-1.5"
              >
                <span>View Longitudinal Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Red Flag Safety Alerts (if any) ─────────────────── */}
        {redFlags && redFlags.length > 0 && (
          <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 border-l-4 border-l-danger-600 text-danger-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-danger-800 text-sm">
              <AlertTriangle className="w-4 h-4 text-danger-600 flex-shrink-0" />
              <span>Clinical Safety Flags (Pre-Consultation Alert)</span>
            </div>
            {redFlags.map((flag, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-danger-200 text-xs">
                <div className="flex items-center justify-between font-semibold text-danger-900">
                  <span>{flag.ruleName}</span>
                  <span className="badge badge-danger text-[10px]">{flag.severity}</span>
                </div>
                <p className="text-danger-700 mt-1">{flag.message}</p>
                <p className="text-xs text-danger-800 font-semibold mt-1">
                  Action: {flag.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Finalized Notification Banner ────────────────────── */}
        {finalizedResult && (
          <div className="p-3.5 rounded-lg bg-success-50 border border-success-200 text-success-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-success-600" />
              <span>{finalizedResult.message}</span>
            </div>
            <span className="text-xs bg-white text-success-800 px-2.5 py-0.5 rounded border border-success-200 font-bold">
              {finalizedResult.promotedRecords?.length || 0} Records Added
            </span>
          </div>
        )}

        {/* ── Tabs Navigation ─────────────────────────────────── */}
        <div className="border-b border-surface-200">
          <div className="flex items-center gap-1 -mb-px">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3.5 py-2.5 font-semibold text-xs border-b-2 transition-colors ${
                activeTab === 'summary'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
              }`}
            >
              Pre-Consultation Briefing
            </button>
            <button
              onClick={() => setActiveTab('facts')}
              className={`px-3.5 py-2.5 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'facts'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
              }`}
            >
              <span>Extracted Clinical Facts</span>
              <span className="badge-neutral badge text-[10px]">{facts.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-3.5 py-2.5 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
              }`}
            >
              <span>Attached Documents</span>
              <span className="badge-neutral badge text-[10px]">{documents.length}</span>
            </button>
            {ayushData && (
              <button
                onClick={() => setActiveTab('ayush')}
                className={`px-3.5 py-2.5 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'ayush'
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>AYUSH Assessment</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Tab 1: Pre-Consultation Briefing ────────────────── */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Briefing */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white p-5 rounded-xl border border-surface-200 space-y-3">
                <div className="flex items-center justify-between border-b border-surface-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <h3 className="font-bold text-surface-900 text-sm">Clinical Intake Brief</h3>
                  </div>
                  <span className="text-[11px] text-surface-400">Provenance: Patient Self-Report & OCR</span>
                </div>

                <div className="bg-surface-50 p-4 rounded-lg border border-surface-100 text-xs whitespace-pre-line text-surface-800 leading-relaxed font-sans">
                  {summary || 'No summary compiled.'}
                </div>

                <p className="text-[11px] text-surface-400">
                  Note: Pre-consultation briefing organizes patient inputs and digitized records. Please verify with patient during encounter.
                </p>
              </div>

              {/* HPI Breakdown */}
              <div className="bg-white p-5 rounded-xl border border-surface-200 space-y-2">
                <h3 className="font-bold text-surface-900 text-xs uppercase tracking-wider text-surface-500">History of Present Illness (HPI)</h3>
                <p className="text-surface-800 text-xs leading-relaxed bg-surface-50 p-3.5 rounded-lg border border-surface-100">
                  {session.structuredData?.hpiSummary || 'No detailed HPI recorded.'}
                </p>
              </div>
            </div>

            {/* Right Col: Quick Clinical Overview */}
            <div className="space-y-5">
              <div className="bg-white p-5 rounded-xl border border-surface-200 space-y-3">
                <h3 className="font-bold text-surface-900 text-xs uppercase tracking-wider text-surface-500">Intake Checklist</h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-surface-400 uppercase">Chief Complaint</span>
                    <p className="font-semibold text-surface-900 mt-0.5">
                      {session.structuredData?.chiefComplaint || 'N/A'}
                    </p>
                    <span className="badge-neutral badge text-[9px] mt-1">PATIENT REPORTED</span>
                  </div>

                  <div className="pt-2 border-t border-surface-100">
                    <span className="text-[10px] font-bold text-surface-400 uppercase">Past Conditions</span>
                    {categorizedFacts.condition.length > 0 ? (
                      <ul className="mt-1 space-y-1">
                        {categorizedFacts.condition.map((c, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-surface-800">{c.concept}</span>
                            <span className="badge-neutral badge text-[9px]">{c.source}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-surface-500 mt-0.5">None reported</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-surface-100">
                    <span className="text-[10px] font-bold text-surface-400 uppercase">Surgical History</span>
                    {categorizedFacts.surgery.length > 0 ? (
                      <ul className="mt-1 space-y-1">
                        {categorizedFacts.surgery.map((s, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-surface-800">{s.concept}</span>
                            <span className="badge-neutral badge text-[9px]">{s.source}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-surface-500 mt-0.5">No surgeries reported</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-surface-100">
                    <span className="text-[10px] font-bold text-surface-400 uppercase">Current Medications</span>
                    {categorizedFacts.medication.length > 0 ? (
                      <ul className="mt-1 space-y-1">
                        {categorizedFacts.medication.map((m, idx) => (
                          <li key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-surface-800">{m.concept}</span>
                            <span className="badge-neutral badge text-[9px]">{m.source}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-surface-500 mt-0.5">No medications reported</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Individual Fact Verification & Provenance ─ */}
        {activeTab === 'facts' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-surface-200 text-xs">
              <p className="text-surface-600">
                Click <strong>Verify</strong> to accept facts into the medical record, or <strong>Edit/Reject</strong> if inaccurate.
              </p>
              <span className="font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded border border-brand-200">
                {facts.filter((f) => f.verified).length} of {facts.length} Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {facts.map((fact) => {
                const isEditing = editingFactId === fact._id;
                return (
                  <div
                    key={fact._id}
                    className={`bg-white p-4 rounded-xl border transition-colors ${
                      fact.verificationStatus === 'REJECTED'
                        ? 'border-danger-200 bg-danger-50/20 opacity-60'
                        : fact.verified
                        ? 'border-success-200 border-l-4 border-l-success-600'
                        : 'border-surface-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-bold text-surface-400">
                            {fact.category}
                          </span>
                          <span
                            className={`badge text-[10px] ${
                              fact.source === 'DOCTOR_VERIFIED'
                                ? 'badge-success'
                                : fact.source === 'DOCUMENT_EXTRACTED'
                                ? 'badge-neutral'
                                : 'badge-brand'
                            }`}
                          >
                            {fact.source?.replace(/_/g, ' ')}
                          </span>
                          {fact.verified && (
                            <span className="badge badge-success text-[10px] flex items-center gap-1">
                              <Check className="w-3 h-3" /> Verified
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="text"
                              value={editedConcept}
                              onChange={(e) => setEditedConcept(e.target.value)}
                              className="input text-xs h-8"
                            />
                            <button
                              onClick={() => handleVerifyFact(fact._id, 'EDIT', { editedConcept })}
                              className="btn-primary btn-sm"
                            >
                              Save & Verify
                            </button>
                            <button onClick={() => setEditingFactId(null)} className="btn-secondary btn-sm">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-surface-900">{fact.concept}</p>
                        )}

                        {fact.originalText && (
                          <p className="text-xs text-surface-500">
                            Patient text: "{fact.originalText}"
                          </p>
                        )}
                        {fact.sourceDocumentId && (
                          <p className="text-xs text-brand-600 font-medium">
                            Extracted from: {fact.sourceDocumentId.fileName}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      {!isEditing && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!fact.verified && (
                            <button
                              onClick={() => handleVerifyFact(fact._id, 'ACCEPT')}
                              className="btn-primary btn-sm flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Verify</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingFactId(fact._id);
                              setEditedConcept(fact.concept);
                            }}
                            className="btn-secondary btn-sm flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          {fact.verificationStatus !== 'REJECTED' && (
                            <button
                              onClick={() => handleVerifyFact(fact._id, 'REJECT')}
                              className="btn-secondary btn-sm text-danger-700 hover:bg-danger-50 flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab 3: Attached Documents ───────────────────────── */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="bg-white p-8 text-center text-xs text-surface-500 border border-surface-200 rounded-xl">
                No physical documents uploaded in this kiosk session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="bg-white p-4 border border-surface-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-5 h-5 text-brand-600" />
                        <div>
                          <p className="font-semibold text-surface-900 text-xs">{doc.title || doc.fileName}</p>
                          <p className="text-[11px] text-surface-400">{doc.documentType}</p>
                        </div>
                      </div>
                      <span className="badge-neutral badge text-[10px]">OCR Parsed</span>
                    </div>

                    {doc.extractedText && (
                      <div className="bg-surface-50 p-3 rounded-lg text-xs font-mono text-surface-700 max-h-36 overflow-y-auto">
                        <p className="font-bold text-surface-500 mb-1">OCR Extracted Content:</p>
                        {doc.extractedText}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <a
                        href={`/api/documents/${doc._id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary btn-sm flex items-center gap-1 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Download File</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 4: AYUSH Assessment Breakdown ───────────────── */}
        {activeTab === 'ayush' && ayushData && (
          <div className="bg-white p-5 border border-surface-200 rounded-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-surface-100 pb-3">
              <Leaf className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-surface-900 text-sm">
                {session.discipline} Clinical Intake Assessment
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ayushData.assessments?.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-surface-50 border border-surface-200">
                  <span className="text-xs uppercase font-bold text-surface-500">{item.fieldLabel}</span>
                  <p className="font-semibold text-surface-900 text-sm mt-1">
                    {typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value || 'N/A')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

