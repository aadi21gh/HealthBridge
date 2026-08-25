import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { recordsService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  AlertTriangle, ShieldCheck, Search, CheckCircle2,
} from 'lucide-react';
import { format } from '../../utils/dateUtils.js';

export default function AllergiesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient-allergies'],
    queryFn: () => recordsService.getMyRecords('allergies'),
    staleTime: 60 * 1000,
  });

  const allergies = data?.data || [];

  const highRisk = allergies.filter(
    (a) => a.criticality === 'high' || a.reaction?.some((r) => r.severity === 'severe')
  );

  const filtered = allergies.filter((a) => {
    const matchesSearch =
      (a.display || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      a.reaction?.some((r) => (r.description || '').toLowerCase().includes(search.toLowerCase()));
    const matchesCat =
      categoryFilter === 'all'
        ? true
        : a.category?.includes(categoryFilter);
    return matchesSearch && matchesCat;
  });

  const categories = [
    { id: 'all', label: 'All Allergies' },
    { id: 'food', label: 'Food' },
    { id: 'medication', label: 'Medication' },
    { id: 'environment', label: 'Environmental' },
    { id: 'biologic', label: 'Biologic' },
  ];

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">Allergies & Adverse Reactions</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Documented sensitivities, adverse drug events, and severity levels for clinical safety.
          </p>
        </div>

        {/* High Risk Critical Alert Banner */}
        {highRisk.length > 0 && (
          <div className="bg-danger-50 border border-danger-200 border-l-4 border-l-danger-600 rounded-r-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-danger-900">
                  {highRisk.length} High-Criticality {highRisk.length === 1 ? 'Allergy' : 'Allergies'} Documented
                </h3>
                <p className="text-xs text-danger-700 mt-0.5">
                  These substances pose acute clinical risk. Attending physicians and emergency teams are alerted automatically.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {highRisk.map((item) => (
                    <span
                      key={item._id}
                      className="px-2.5 py-1 rounded bg-white border border-danger-300 text-danger-800 text-xs font-semibold"
                    >
                      {item.display}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search allergens or symptoms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-brand-600 text-white font-semibold'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-xl text-center py-12">
            <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-surface-300" />
            <h3 className="text-sm font-semibold text-surface-800">No allergies found</h3>
            <p className="text-xs text-surface-400 mt-1">
              {search ? 'No matching allergen found for your search query.' : 'No recorded sensitivities in this category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const isHigh = item.criticality === 'high';
              return (
                <div
                  key={item._id}
                  className={`bg-white border rounded-xl p-5 flex flex-col justify-between ${
                    isHigh ? 'border-danger-200 border-l-4 border-l-danger-600' : 'border-surface-200'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-surface-900 text-base">
                          {item.display}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.category?.map((c) => (
                            <span key={c} className="text-xs text-surface-500 capitalize">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span
                        className={`badge text-xs uppercase ${
                          isHigh ? 'badge-danger font-semibold' : 'badge-warning'
                        }`}
                      >
                        {item.criticality} risk
                      </span>
                    </div>

                    {/* Reactions */}
                    {item.reaction && item.reaction.length > 0 && (
                      <div className="space-y-1.5 py-2.5 border-t border-surface-100">
                        <p className="text-xs font-medium text-surface-500">Observed reactions:</p>
                        {item.reaction.map((r, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-surface-50 px-2.5 py-1.5 rounded-md">
                            <span className="text-surface-800">{r.description || 'Allergic symptoms'}</span>
                            {r.severity && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                                  r.severity === 'severe'
                                    ? 'bg-danger-100 text-danger-700'
                                    : r.severity === 'moderate'
                                    ? 'bg-warning-100 text-warning-800'
                                    : 'bg-surface-200 text-surface-700'
                                }`}
                              >
                                {r.severity}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-xs text-surface-600 mt-2 bg-surface-50 p-2.5 rounded-lg">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between text-xs text-surface-400">
                    <span className="flex items-center gap-1 text-surface-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                      Status: <span className="capitalize font-medium">{item.verificationStatus || 'Confirmed'}</span>
                    </span>
                    {item.onsetDate && (
                      <span>Onset: {format(item.onsetDate)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

