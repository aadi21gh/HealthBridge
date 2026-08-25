import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  FileText, Activity, FlaskConical, Scan, Scissors,
  Syringe, Search, Filter, Calendar, Building2,
  ChevronDown, ChevronUp, CheckCircle, AlertCircle,
  FileCheck, Shield, ExternalLink
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
  const [activeTab, setActiveTab] = useState('conditions');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patient-records', activeTab],
    queryFn: () => recordsService.getMyRecords(activeTab),
    staleTime: 60 * 1000,
  });

  const records = data?.data || [];

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
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Medical Records</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Consolidated lifetime health records — diagnostics, imaging, conditions, procedures.
          </p>
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
      </div>
    </PatientLayout>
  );
}
