import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { consentService } from '../../services/healthbridge.js';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import { Link } from 'react-router-dom';
import {
  ClipboardList, Clock, Shield, ChevronRight, Search,
} from 'lucide-react';
import { format } from '../../utils/dateUtils.js';

export default function DoctorConsentsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['doctor-consents'],
    queryFn: () => consentService.getDoctorConsents(),
    staleTime: 60 * 1000,
  });

  const filtered = consents.filter((c) => {
    const p = c.patientId;
    const name = p?.userId ? `${p.userId.firstName} ${p.userId.lastName}` : '';
    const purpose = c.purpose || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      purpose.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterTabs = [
    { value: 'all', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'REVOKED', label: 'Revoked' },
  ];

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">Access Requests & Consent Status</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Track the status of all submitted patient data consent requests.
            </p>
          </div>

          <Link to="/doctor/search" className="btn-primary btn-sm flex items-center gap-2 self-start sm:self-auto">
            <Shield className="w-3.5 h-3.5" />
            New Access Request
          </Link>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === tab.value
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-xl text-center py-16">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <h3 className="text-sm font-semibold text-surface-800">No consent requests found</h3>
            <p className="text-xs text-surface-400 mt-1">
              {search ? 'Try adjusting your search criteria.' : 'No records match this status.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const patient = c.patientId;
              const user = patient?.userId;
              const name = user ? `${user.firstName} ${user.lastName}` : 'Patient';

              return (
                <div
                  key={c._id}
                  className="bg-white border border-surface-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-surface-900 text-sm">{name}</h3>
                        <span className={`badge status-${c.status} text-[10px]`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-surface-600 mt-0.5">
                        <span className="text-surface-400 font-medium">Purpose:</span> {c.purpose}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400 mt-1">
                        <span>Requested: {format(c.createdAt)}</span>
                        {c.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {format(c.expiresAt)}
                          </span>
                        )}
                        {c.scope && (
                          <span className="text-surface-500">
                            Scope: {c.scope.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center flex-shrink-0">
                    {c.status === 'APPROVED' ? (
                      <Link
                        to={`/doctor/patients/${patient?._id}`}
                        className="btn-primary btn-sm flex items-center gap-1.5 whitespace-nowrap text-xs"
                      >
                        View Records
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-xs text-surface-400 font-medium">
                        {c.status === 'PENDING' ? 'Awaiting patient approval' : 'Access closed'}
                      </span>
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

