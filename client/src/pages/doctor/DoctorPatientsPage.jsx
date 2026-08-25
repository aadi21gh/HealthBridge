import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { consentService } from '../../services/healthbridge.js';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import { Link } from 'react-router-dom';
import {
  Users, Search, Clock, FileText, ArrowUpRight,
} from 'lucide-react';
import { format } from '../../utils/dateUtils.js';

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('');

  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['doctor-consents'],
    queryFn: () => consentService.getDoctorConsents(),
    staleTime: 60 * 1000,
  });

  const approved = consents.filter((c) => c.status === 'APPROVED');

  const filtered = approved.filter((c) => {
    const p = c.patientId;
    const name = p?.userId ? `${p.userId.firstName} ${p.userId.lastName}` : '';
    const email = p?.userId?.email || '';
    const purpose = c.purpose || '';
    const term = search.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term) || purpose.toLowerCase().includes(term);
  });

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">Authorized Patients</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Active patient profiles where explicit patient consent has been verified.
            </p>
          </div>

          <Link to="/doctor/search" className="btn-primary btn-sm flex items-center gap-2 self-start sm:self-auto">
            <Search className="w-3.5 h-3.5" />
            Request Patient Access
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, email, purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs h-9"
            />
          </div>
          <span className="text-xs text-surface-500 font-medium whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'patient' : 'patients'}
          </span>
        </div>

        {/* Patients List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-xl text-center py-16">
            <Users className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <h3 className="text-sm font-semibold text-surface-800">No authorized patients found</h3>
            <p className="text-xs text-surface-400 mt-1">
              {search ? 'No patients match your search criteria.' : 'You do not have any active consented patients.'}
            </p>
            <Link to="/doctor/search" className="btn-secondary btn-sm mt-4 inline-flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              Search & Request Access
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((consent) => {
              const patient = consent.patientId;
              const user = patient?.userId;
              const name = user ? `${user.firstName} ${user.lastName}` : 'Patient';

              return (
                <div
                  key={consent._id}
                  className="bg-white border border-surface-200 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-surface-900 text-sm">
                            {name}
                          </h3>
                          <p className="text-xs text-surface-400 font-mono">
                            {user?.email || 'ID: ' + patient?._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                      <span className="badge badge-success text-[10px]">
                        Active Consent
                      </span>
                    </div>

                    <div className="space-y-1 py-2 border-t border-surface-100 text-xs text-surface-600">
                      <p className="text-surface-700">
                        <span className="meta-label block mb-0.5">Purpose</span>
                        {consent.purpose}
                      </p>
                      {consent.expiresAt && (
                        <p className="flex items-center gap-1.5 text-surface-500 pt-1">
                          <Clock className="w-3.5 h-3.5 text-surface-400" />
                          Valid until: <strong className="text-surface-700">{format(consent.expiresAt)}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between">
                    <span className="text-[11px] text-surface-400">
                      Granted {format(consent.createdAt)}
                    </span>
                    <Link
                      to={`/doctor/patients/${patient?._id}`}
                      className="btn-primary btn-sm flex items-center gap-1.5 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Medical Records
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
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

