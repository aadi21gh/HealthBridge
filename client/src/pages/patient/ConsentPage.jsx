import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp, Building2, Calendar } from 'lucide-react';
import { format, formatDateTime } from '../../utils/dateUtils.js';
import { useState } from 'react';

const STATUS_CONFIG = {
  PENDING: { label: 'Pending review', badgeClass: 'badge-warning', border: 'border-l-warning-400' },
  APPROVED: { label: 'Active consent', badgeClass: 'badge-success', border: 'border-l-success-500' },
  REJECTED: { label: 'Rejected', badgeClass: 'badge-danger', border: 'border-l-surface-300' },
  REVOKED: { label: 'Revoked', badgeClass: 'badge-neutral', border: 'border-l-surface-300' },
  EXPIRED: { label: 'Expired', badgeClass: 'badge-neutral', border: 'border-l-surface-300' },
};

const SCOPE_LABELS = {
  conditions: 'Diagnoses & Conditions',
  allergies: 'Allergies',
  medications: 'Medications & Prescriptions',
  procedures: 'Procedures & Surgeries',
  observations: 'Lab Observations',
  diagnosticReports: 'Lab Reports',
  imagingStudies: 'Imaging Studies',
  documents: 'Documents',
  encounters: 'Clinical Encounters',
  immunizations: 'Vaccinations',
};

const ConsentCard = ({ consent, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [showRevokeForm, setShowRevokeForm] = useState(false);
  const status = STATUS_CONFIG[consent.status] || STATUS_CONFIG.PENDING;

  const doctor = consent.requestingPractitionerId;
  const doctorName = doctor?.userId
    ? `Dr. ${doctor.userId.firstName} ${doctor.userId.lastName}`
    : 'Unknown Practitioner';
  const orgName = consent.requestingOrganizationId?.name || 'Authorized Clinical Facility';

  return (
    <div className={`bg-white border border-surface-200 border-l-4 ${status.border} rounded-r-lg overflow-hidden`}>
      {/* Header */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-semibold text-surface-900 text-base">{doctorName}</h3>
            <span className={`badge ${status.badgeClass}`}>{status.label}</span>
          </div>
          
          <div className="flex items-center gap-4 mt-1.5 text-xs text-surface-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-surface-400" />
              {orgName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-surface-400" />
              Requested {format(consent.requestedAt)}
            </span>
          </div>

          <div className="mt-3 p-3 rounded-lg bg-surface-50 border border-surface-100 text-xs text-surface-700">
            <span className="meta-label block mb-0.5">Clinical Purpose</span>
            {consent.purpose}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 text-surface-400 hover:text-surface-700 rounded transition-colors flex-shrink-0 mt-0.5"
          aria-label={expanded ? 'Hide details' : 'Show details'}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-surface-100 bg-surface-50/50 space-y-4 text-xs">
          <div>
            <p className="meta-label mb-2">Authorized Scope</p>
            <div className="flex flex-wrap gap-1.5">
              {consent.scope.map((item) => (
                <span key={item} className="badge-neutral badge text-xs font-normal">
                  {SCOPE_LABELS[item] || item}
                </span>
              ))}
            </div>
          </div>

          {consent.status === 'APPROVED' && consent.expiresAt && (
            <div className="flex items-center gap-2 text-surface-600">
              <Clock className="w-3.5 h-3.5 text-surface-400" />
              <span>Valid until {formatDateTime(consent.expiresAt)}</span>
            </div>
          )}

          {consent.revokedAt && (
            <p className="text-surface-500">Revoked on {formatDateTime(consent.revokedAt)}</p>
          )}
          {consent.revocationReason && (
            <p className="text-surface-600">Revocation reason: {consent.revocationReason}</p>
          )}

          {/* Action buttons */}
          {consent.status === 'PENDING' && (
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => onAction('approve', consent._id)}
                className="btn-primary btn-sm flex-1"
                id={`approve-${consent._id}`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve Access (30 days)
              </button>
              <button
                onClick={() => onAction('reject', consent._id)}
                className="btn-secondary btn-sm flex-1"
                id={`reject-${consent._id}`}
              >
                <XCircle className="w-3.5 h-3.5 text-surface-400" />
                Reject
              </button>
            </div>
          )}

          {consent.status === 'APPROVED' && (
            <div className="pt-2">
              {!showRevokeForm ? (
                <button
                  onClick={() => setShowRevokeForm(true)}
                  className="btn-secondary btn-sm text-danger-700 hover:bg-danger-50 border-surface-200"
                  id={`revoke-btn-${consent._id}`}
                >
                  Revoke Access
                </button>
              ) : (
                <div className="space-y-2.5 p-3.5 bg-white border border-surface-200 rounded-lg">
                  <div className="alert-warning py-2 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Revocation will immediately terminate this clinician's access to your records.</span>
                  </div>
                  <textarea
                    className="input text-xs resize-none"
                    rows={2}
                    placeholder="Reason for revocation (optional)"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAction('revoke', consent._id, revokeReason)}
                      className="btn-danger btn-sm"
                      id={`confirm-revoke-${consent._id}`}
                    >
                      Confirm Revocation
                    </button>
                    <button onClick={() => setShowRevokeForm(false)} className="btn-secondary btn-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ConsentPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');

  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['consents', filter],
    queryFn: () => consentService.getMyConsents(filter ? { status: filter } : {}),
    staleTime: 30 * 1000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }) => consentService.approveConsent(id, 30),
    onSuccess: () => queryClient.invalidateQueries(['consents']),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id }) => consentService.rejectConsent(id),
    onSuccess: () => queryClient.invalidateQueries(['consents']),
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }) => consentService.revokeConsent(id, reason),
    onSuccess: () => queryClient.invalidateQueries(['consents']),
  });

  const handleAction = (action, id, reason = '') => {
    if (action === 'approve') approveMutation.mutate({ id });
    if (action === 'reject') rejectMutation.mutate({ id });
    if (action === 'revoke') revokeMutation.mutate({ id, reason });
  };

  const pending = consents.filter((c) => c.status === 'PENDING');

  const filterTabs = [
    { value: '', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Active' },
    { value: 'REVOKED', label: 'Revoked' },
    { value: 'EXPIRED', label: 'Expired' },
  ];

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Consent Management</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Control which practitioners and health institutions can access your medical records.
          </p>
        </div>

        {/* Pending alert */}
        {pending.length > 0 && (
          <div className="alert-warning">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-warning-600" />
            <div>
              <p className="font-semibold text-xs text-warning-800">
                {pending.length} pending access request{pending.length > 1 ? 's' : ''} require your decision
              </p>
              <p className="text-xs text-warning-700 mt-0.5">
                Authorized practitioners cannot view records without your explicit approval.
              </p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="border-b border-surface-200">
          <div className="flex items-center gap-1 -mb-px">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  filter === tab.value
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-surface-500 hover:text-surface-800 hover:border-surface-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Consent list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-lg" />)}
          </div>
        ) : consents.length === 0 ? (
          <div className="text-center py-16 bg-white border border-surface-200 rounded-xl">
            <Shield className="w-8 h-8 mx-auto text-surface-300 mb-2" />
            <p className="font-semibold text-sm text-surface-700">No consent records found</p>
            <p className="text-xs text-surface-400 mt-1">
              {filter ? 'No requests match the selected filter.' : 'When a doctor requests access to your records, it will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map((consent) => (
              <ConsentCard key={consent._id} consent={consent} onAction={handleAction} />
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
