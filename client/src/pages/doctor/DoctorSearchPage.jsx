import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { patientService, consentService } from '../../services/healthbridge.js';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import {
  Search, Shield, Send, CheckCircle2,
  AlertCircle, Loader2, Phone, Mail, X
} from 'lucide-react';

const ALL_SCOPES = [
  { id: 'conditions', label: 'Conditions & Diagnoses' },
  { id: 'medications', label: 'Medications & Prescriptions' },
  { id: 'allergies', label: 'Allergies & Intolerances' },
  { id: 'diagnosticReports', label: 'Lab Reports' },
  { id: 'imagingStudies', label: 'Imaging & Scans' },
  { id: 'procedures', label: 'Surgical Procedures' },
  { id: 'immunizations', label: 'Immunizations' },
];

export default function DoctorSearchPage() {
  const [query, setQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [purpose, setPurpose] = useState('Medical Consultation and Review');
  const [durationDays, setDurationDays] = useState(30);
  const [scopes, setScopes] = useState([
    'conditions', 'medications', 'allergies', 'diagnosticReports', 'imagingStudies', 'procedures', 'immunizations'
  ]);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['doctor-search-patients', query],
    queryFn: () => patientService.searchPatients(query),
    staleTime: 30 * 1000,
  });

  const requestMutation = useMutation({
    mutationFn: ({ patientId, data }) => consentService.requestAccess(patientId, data),
    onSuccess: () => {
      setRequestSuccess(`Consent request successfully sent to ${selectedPatient.userId?.firstName || 'the patient'}. The patient will receive a notification to approve access.`);
      setRequestError('');
      setSelectedPatient(null);
      setTimeout(() => setRequestSuccess(''), 6000);
    },
    onError: (err) => {
      setRequestError(err.response?.data?.error?.message || 'Failed to submit consent request.');
    },
  });

  const handleToggleScope = (scopeId) => {
    if (scopes.includes(scopeId)) {
      setScopes(scopes.filter((s) => s !== scopeId));
    } else {
      setScopes([...scopes, scopeId]);
    }
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    requestMutation.mutate({
      patientId: selectedPatient._id,
      data: {
        purpose,
        durationDays: Number(durationDays),
        scope: scopes,
      },
    });
  };

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Patient Search & Access Request</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Search patients by name, email, or HealthBridge ID and submit secure consent requests.
          </p>
        </div>

        {/* Notifications */}
        {requestSuccess && (
          <div className="alert-success flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">{requestSuccess}</p>
          </div>
        )}

        {requestError && (
          <div className="alert-danger flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs font-medium">{requestError}</p>
          </div>
        )}

        {/* Search input */}
        <div className="bg-white border border-surface-200 rounded-xl p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-surface-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, email, or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-10 text-xs h-10"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="space-y-3">
          <h2 className="font-semibold text-surface-900 text-sm">
            Search Results ({patients.length})
          </h2>

          {isLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="bg-white border border-surface-200 rounded-xl text-center py-12 text-surface-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-surface-300" />
              <p className="text-sm font-medium text-surface-700">No matching patients found</p>
              <p className="text-xs text-surface-400 mt-1">Try entering a different name or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((p) => {
                const user = p.userId;
                const name = user ? `${user.firstName} ${user.lastName}` : 'Patient';

                return (
                  <div
                    key={p._id}
                    className="bg-white border border-surface-200 rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-surface-900 text-sm">{name}</h3>
                        <div className="text-xs text-surface-500 space-y-0.5 mt-1">
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-surface-400" />
                            {user?.email}
                          </p>
                          {user?.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-surface-400" />
                              {user.phone}
                            </p>
                          )}
                          {p.bloodGroup && (
                            <p className="text-brand-700 font-medium">
                              Blood Group: {p.bloodGroup}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between">
                      <span className="text-[11px] text-surface-400 font-mono">
                        ID: {p._id.slice(-8)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(p);
                          setRequestError('');
                        }}
                        className="btn-primary btn-sm flex items-center gap-1.5 text-xs"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Request Access
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal / Request Access Dialog */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl border border-surface-200 space-y-5 animate-scale-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-surface-900">Request Clinical Consent</h3>
                  <p className="text-xs text-surface-500 mt-0.5">
                    To: <strong className="text-surface-800">{selectedPatient.userId?.firstName} {selectedPatient.userId?.lastName}</strong> ({selectedPatient.userId?.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="text-surface-400 hover:text-surface-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-4">
                <div className="form-group">
                  <label className="label">Clinical Purpose</label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Diagnostic consultation, preoperative review"
                    className="input text-xs"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Requested Access Duration</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="input text-xs"
                  >
                    <option value={7}>7 Days</option>
                    <option value={15}>15 Days</option>
                    <option value={30}>30 Days (Standard)</option>
                    <option value={90}>90 Days</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="label">Authorized Scope</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-surface-100 rounded-lg">
                    {ALL_SCOPES.map((sc) => (
                      <label
                        key={sc.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          scopes.includes(sc.id)
                            ? 'bg-brand-50 border-brand-300 text-brand-900 font-medium'
                            : 'bg-white border-surface-200 text-surface-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={scopes.includes(sc.id)}
                          onChange={() => handleToggleScope(sc.id)}
                          className="w-3.5 h-3.5 text-brand-600 rounded"
                        />
                        <span className="truncate">{sc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-100">
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requestMutation.isPending || scopes.length === 0}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    {requestMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {requestMutation.isPending ? 'Sending request…' : 'Send Consent Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

