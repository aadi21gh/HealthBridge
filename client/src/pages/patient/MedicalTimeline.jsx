import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '../../services/healthbridge.js';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  Clock, Hospital, FlaskConical, Scan, Syringe, Scissors,
  ChevronDown, ChevronUp, Filter, Building2, Calendar, Stethoscope,
} from 'lucide-react';
import { format, getYear } from '../../utils/dateUtils.js';

// Event type display mapping — no colors, just labels
const EVENT_TYPES = {
  ENCOUNTER: { label: 'Encounter', border: 'border-l-brand-400' },
  CONDITION: { label: 'Condition', border: 'border-l-warning-400' },
  MEDICATION: { label: 'Medication', border: 'border-l-info-400' },
  LAB_REPORT: { label: 'Lab Report', border: 'border-l-success-500' },
  PROCEDURE: { label: 'Procedure', border: 'border-l-surface-400' },
  IMAGING: { label: 'Imaging', border: 'border-l-surface-400' },
  IMMUNIZATION: { label: 'Immunization', border: 'border-l-success-500' },
  OBSERVATION: { label: 'Observation', border: 'border-l-surface-300' },
};

const ALL_TYPES = Object.keys(EVENT_TYPES);

export default function MedicalTimeline() {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['patient-timeline'],
    queryFn: patientService.getMyTimeline,
    staleTime: 2 * 60 * 1000,
  });

  const events = data?.events || [];

  const filtered = selectedTypes.length > 0
    ? events.filter((e) => selectedTypes.includes(e.type))
    : events;

  // Group events by year
  const groupedByYear = filtered.reduce((acc, event) => {
    const year = new Date(
      event.date || event.startDate || event.createdAt
    ).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear).sort((a, b) => b - a);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <PatientLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900">Medical Timeline</h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {events.length} events — chronological clinical history
            </p>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="meta-label">Filter:</span>
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
                selectedTypes.includes(type)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
              }`}
            >
              {EVENT_TYPES[type]?.label || type}
            </button>
          ))}
          {selectedTypes.length > 0 && (
            <button
              onClick={() => setSelectedTypes([])}
              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-lg" />)}
          </div>
        ) : years.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-surface-200">
            <Clock className="w-8 h-8 mx-auto text-surface-300 mb-3" />
            <h3 className="text-sm font-semibold text-surface-700">No events found</h3>
            <p className="text-xs text-surface-400 mt-1">
              {selectedTypes.length > 0 ? 'Try adjusting your filters' : 'No clinical events are on record yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year}>
                {/* Year marker */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold text-surface-800">{year}</span>
                  <div className="flex-1 border-t border-surface-200" />
                  <span className="text-xs text-surface-400">{groupedByYear[year].length} events</span>
                </div>

                {/* Events in this year */}
                <div className="space-y-2">
                  {groupedByYear[year].map((event) => {
                    const isExpanded = expandedId === event._id;
                    const meta = EVENT_TYPES[event.type] || { label: event.type, border: 'border-l-surface-300' };
                    const date = event.date || event.startDate || event.createdAt;

                    return (
                      <div
                        key={event._id}
                        className={`bg-white border border-surface-200 border-l-4 ${meta.border} rounded-r-lg overflow-hidden`}
                      >
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : event._id)}
                          className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-surface-50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="meta-label">{meta.label}</span>
                              {event.clinicalStatus === 'active' && (
                                <span className="badge-success badge text-[10px]">Active</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-surface-900 mt-0.5">
                              {event.title || event.display || event.code || 'Clinical Event'}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                              {date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(date)}
                                </span>
                              )}
                              {event.organizationId?.name && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {event.organizationId.name}
                                </span>
                              )}
                              {event.doctorId?.firstName && (
                                <span className="flex items-center gap-1">
                                  <Stethoscope className="w-3 h-3" />
                                  Dr. {event.doctorId.firstName} {event.doctorId.lastName}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="flex-shrink-0 mt-1">
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-surface-400" />
                              : <ChevronDown className="w-4 h-4 text-surface-400" />}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 pt-2 border-t border-surface-100 bg-surface-50/40 text-xs text-surface-600 animate-fade-in space-y-2">
                            {event.notes && (
                              <div>
                                <p className="meta-label mb-1">Clinical Notes</p>
                                <p className="text-surface-800 bg-white p-3 rounded border border-surface-100">{event.notes}</p>
                              </div>
                            )}
                            {event.conclusion && (
                              <div>
                                <p className="meta-label mb-1">Conclusion</p>
                                <p className="text-surface-800 bg-white p-3 rounded border border-surface-100">{event.conclusion}</p>
                              </div>
                            )}
                            {event.results?.length > 0 && (
                              <div>
                                <p className="meta-label mb-1">Results</p>
                                <div className="bg-white rounded border border-surface-100 divide-y divide-surface-100">
                                  {event.results.map((r, i) => (
                                    <div key={i} className="flex items-center justify-between px-3 py-2">
                                      <span className="text-surface-700">{r.display || 'Test'}</span>
                                      <span className="font-mono font-semibold text-surface-900">{r.value} {r.unit}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-4 pt-1 text-[10px] text-surface-400">
                              <span>FHIR ID: <span className="font-mono">{event.fhirId || event._id?.slice(-8)}</span></span>
                              {event.patientReported && <span className="badge-neutral badge">Patient reported</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

