import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '../../services/healthbridge.js';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import {
  History, Eye, AlertTriangle, Search,
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils.js';

export default function DoctorAuditPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor-audit'],
    queryFn: () => auditService.getMyAuditHistory(),
    staleTime: 60 * 1000,
  });

  const events = data?.data || [];

  const filtered = events.filter((e) => {
    const term = search.toLowerCase();
    const action = (e.action || '').toLowerCase();
    const target = (e.targetType || '').toLowerCase();
    return action.includes(term) || target.includes(term);
  });

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Clinical Audit Trail</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Cryptographically signed and immutable audit log of your patient record access activities.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit actions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs h-9"
            />
          </div>
          <span className="text-xs text-surface-500 font-medium whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Audit List */}
        {isLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-xl text-center py-16">
            <History className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <h3 className="text-sm font-semibold text-surface-800">No audit events recorded</h3>
            <p className="text-xs text-surface-400 mt-1">
              Audit events will appear here when you access or review patient medical records.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-surface-200 rounded-xl divide-y divide-surface-100 overflow-hidden">
            {filtered.map((event) => {
              const isEmergency = event.action === 'EMERGENCY_ACCESS';
              return (
                <div
                  key={event._id}
                  className={`p-4 flex items-center justify-between gap-4 hover:bg-surface-50 transition-colors ${
                    isEmergency ? 'bg-danger-50/30 border-l-4 border-l-danger-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isEmergency
                          ? 'bg-danger-100 text-danger-600'
                          : 'bg-surface-100 text-surface-600'
                      }`}
                    >
                      {isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-surface-900 text-xs">{event.action}</p>
                        {event.targetType && (
                          <span className="badge-neutral badge text-[10px] uppercase">
                            {event.targetType}
                          </span>
                        )}
                        {isEmergency && (
                          <span className="badge-danger badge text-[10px]">Break-Glass</span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {event.notes || (event.targetId ? `Target: ${event.targetId}` : 'Patient record access')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-surface-400 flex-shrink-0">
                    <p className="font-medium text-surface-700 tabular-nums">{formatDateTime(event.createdAt || event.timestamp)}</p>
                    {event.ipAddress && (
                      <p className="text-[11px] text-surface-400 font-mono mt-0.5">IP: {event.ipAddress}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

