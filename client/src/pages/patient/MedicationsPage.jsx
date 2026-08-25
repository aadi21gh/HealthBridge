import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  Pill, Search, Calendar, Clock, CheckCircle2,
  Building2,
} from 'lucide-react';
import { format } from '../../utils/dateUtils.js';

export default function MedicationsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient-medications'],
    queryFn: () => recordsService.getMyRecords('medications'),
    staleTime: 60 * 1000,
  });

  const medications = data?.data || [];

  const activeMeds = medications.filter((m) => m.status === 'active');
  const pastMeds = medications.filter((m) => m.status !== 'active');

  const filtered = medications.filter((m) => {
    const matchesSearch =
      (m.medicationDisplay || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.dosage?.text || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ? true : m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = [
    { id: 'all', label: 'All Medications' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'stopped', label: 'Discontinued' },
  ];

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Prescriptions & Medications</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Active medication schedules, dosage instructions, and historical treatment courses.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-surface-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-surface-900 tabular-nums">{medications.length}</p>
            <p className="text-xs text-surface-500 font-medium mt-0.5">Total Prescriptions</p>
          </div>
          <div className="bg-white border border-surface-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-success-700 tabular-nums">{activeMeds.length}</p>
            <p className="text-xs text-surface-500 font-medium mt-0.5">Currently Active</p>
          </div>
          <div className="bg-white border border-surface-200 rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-surface-700 tabular-nums">{pastMeds.length}</p>
            <p className="text-xs text-surface-500 font-medium mt-0.5">Past Courses</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medication or dosage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === s.id
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Medications List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-xl text-center py-12">
            <Pill className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <h3 className="text-sm font-semibold text-surface-800">No medications found</h3>
            <p className="text-xs text-surface-400 mt-1">
              {search ? 'Try adjusting your search criteria.' : 'No prescription records in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((med) => {
              const isActive = med.status === 'active';
              return (
                <div
                  key={med._id}
                  className={`bg-white border rounded-xl p-5 flex flex-col justify-between ${
                    isActive ? 'border-surface-200 border-l-4 border-l-brand-600' : 'border-surface-200 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-surface-900 text-base">
                          {med.medicationDisplay}
                        </h3>
                        {med.medicationCode && (
                          <p className="text-[11px] text-surface-400 font-mono mt-0.5">
                            RxNorm: {med.medicationCode}
                          </p>
                        )}
                      </div>
                      <span
                        className={`badge text-xs capitalize ${
                          isActive ? 'badge-success' : 'badge-neutral'
                        }`}
                      >
                        {med.status}
                      </span>
                    </div>

                    {/* Dosage details */}
                    <div className="space-y-1.5 py-2.5 border-t border-surface-100 text-xs">
                      {(med.dosage?.text || med.dosage?.value) && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-surface-500 font-medium min-w-16">Dosage:</span>
                          <span className="text-surface-900 font-semibold">
                            {med.dosage?.text || `${med.dosage?.value || ''} ${med.dosage?.unit || ''} ${med.dosage?.route ? `(${med.dosage.route})` : ''}`}
                          </span>
                        </div>
                      )}
                      {med.frequency && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-surface-500 font-medium min-w-16">Frequency:</span>
                          <span className="text-surface-800">{med.frequency}</span>
                        </div>
                      )}
                      {(med.startDate || med.createdAt) && (
                        <div className="flex items-baseline gap-2">
                          <span className="text-surface-500 font-medium min-w-16">Prescribed:</span>
                          <span className="text-surface-700">
                            {format(med.startDate || med.createdAt)}
                          </span>
                        </div>
                      )}
                      {med.notes && (
                        <div className="mt-2 p-2.5 rounded-lg bg-surface-50 text-surface-700 text-xs border border-surface-100">
                          <span className="meta-label block mb-0.5">Instructions</span>
                          {med.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {med.organizationId && (
                    <div className="mt-3 pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {typeof med.organizationId === 'object' ? med.organizationId.name : 'Authorized Clinic'}
                      </span>
                      <span className="text-xs text-brand-600 font-medium">ABDM Linked</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

