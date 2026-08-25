import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import { History, AlertTriangle, Eye, FileText, Shield, Download, LogIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils.js';
import { useState } from 'react';

const ACTION_CONFIG = {
  VIEW_PATIENT: { label: 'Profile viewed' },
  VIEW_RECORD: { label: 'Record accessed' },
  VIEW_DOCUMENT: { label: 'Document viewed' },
  DOWNLOAD_DOCUMENT: { label: 'Document downloaded' },
  APPROVE_CONSENT: { label: 'Consent approved' },
  REVOKE_CONSENT: { label: 'Consent revoked' },
  EMERGENCY_ACCESS: { label: 'Break-Glass Emergency Access' },
  LOGIN: { label: 'Account login' },
  AI_QUERY: { label: 'Clinical AI record query' },
};

const AuditRow = ({ event }) => {
  const config = ACTION_CONFIG[event.action] || { label: event.action };
  const actor = event.actorId;
  const actorName = actor
    ? `${actor.firstName} ${actor.lastName} (${actor.role})`
    : 'Unknown User';

  return (
    <div className={`bg-white p-4 rounded-lg border transition-colors ${
      event.emergencyFlag
        ? 'border-danger-200 border-l-4 border-l-danger-600 bg-danger-50/20'
        : 'border-surface-200 hover:bg-surface-50'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold ${event.emergencyFlag ? 'text-danger-800' : 'text-surface-900'}`}>
              {config.label}
            </span>
            {event.emergencyFlag && (
              <span className="badge badge-danger text-[10px]">Emergency Protocol</span>
            )}
          </div>
          <p className="text-xs text-surface-600 mt-0.5">By: <strong className="text-surface-800 font-medium">{actorName}</strong></p>
          
          {event.organizationId?.name && (
            <p className="text-[11px] text-surface-400 mt-0.5">{event.organizationId.name}</p>
          )}

          {event.emergencyReason && (
            <div className="mt-2 p-2 rounded bg-danger-50 border border-danger-200 text-xs">
              <span className="font-semibold text-danger-800 block mb-0.5">Break-Glass Emergency Justification:</span>
              <span className="text-danger-700">{event.emergencyReason}</span>
            </div>
          )}

          {event.purpose && !event.emergencyReason && (
            <p className="text-xs text-surface-500 mt-1">Purpose: {event.purpose}</p>
          )}
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-xs text-surface-500 tabular-nums">{formatDateTime(event.timestamp)}</p>
        </div>
      </div>
    </div>
  );
};

export default function AccessHistoryPage() {
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-history', emergencyOnly, page],
    queryFn: () => auditService.getMyAuditHistory({
      emergencyOnly: emergencyOnly ? 'true' : undefined,
      page,
      limit: 20,
    }),
    staleTime: 30 * 1000,
  });

  const events = data?.data || [];
  const pagination = data?.pagination;

  const emergencyCount = events.filter((e) => e.emergencyFlag).length;

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Access History & Audit Log</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Immutable log of all clinical and administrative access events to your health records.
          </p>
        </div>

        {/* Emergency alert */}
        {emergencyCount > 0 && (
          <div className="alert-danger">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="font-semibold text-xs text-danger-900">Emergency (Break-Glass) Access Events Recorded</p>
              <p className="text-xs text-danger-700 mt-0.5">
                {emergencyCount} event(s) bypassed standard consent under medical emergency protocol.
              </p>
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="border-b border-surface-200">
          <div className="flex items-center gap-1 -mb-px">
            <button
              onClick={() => { setEmergencyOnly(false); setPage(1); }}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                !emergencyOnly
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              All Access Events
            </button>
            <button
              onClick={() => { setEmergencyOnly(true); setPage(1); }}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                emergencyOnly
                  ? 'border-danger-600 text-danger-700'
                  : 'border-transparent text-surface-500 hover:text-surface-800'
              }`}
            >
              Emergency Access Only
            </button>
          </div>
        </div>

        {/* Event List */}
        {isLoading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-lg" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white border border-surface-200 rounded-xl">
            <History className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <p className="font-semibold text-sm text-surface-700">No access events found</p>
            <p className="text-xs text-surface-400 mt-1">Audit log will record all upcoming accesses.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <AuditRow key={event._id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-surface-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary btn-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="btn-secondary btn-sm"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-200 text-xs text-surface-500">
          <p>
            <strong className="text-surface-700 font-medium">Compliance note:</strong> This audit trail is ABDM-compliant and cryptographically tamper-evident. Access entries cannot be altered or removed.
          </p>
        </div>
      </div>
    </PatientLayout>
  );
}

