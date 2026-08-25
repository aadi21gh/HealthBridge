import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext.jsx';
import { consentService } from '../../services/healthbridge.js';
import DoctorLayout from '../../layouts/DoctorLayout.jsx';
import {
  Users, ClipboardList, Clock, CheckCircle, AlertTriangle,
  ChevronRight, Search, Building2, Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from '../../utils/dateUtils.js';

const StatCard = ({ icon: Icon, label, value, color = 'brand', to }) => (
  <Link to={to} className="bg-white border border-surface-200 rounded-xl p-4 hover:border-surface-300 transition-colors">
    <p className="text-2xl font-bold text-surface-900 tabular-nums">{value ?? 0}</p>
    <p className="text-sm font-medium text-surface-600 mt-1">{label}</p>
  </Link>
);

const ConsentRow = ({ consent }) => {
  const patient = consent.patientId;
  const patientName = patient?.userId
    ? `${patient.userId.firstName} ${patient.userId.lastName}`
    : 'Unknown Patient';

  const isExpiringSoon = consent.status === 'APPROVED' && consent.expiresAt &&
    (new Date(consent.expiresAt) - new Date()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <Link
      to={`/doctor/patients/${patient?._id}`}
      className="flex items-center gap-3 p-3 rounded-lg border border-surface-100 hover:bg-surface-50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
        <span className="text-brand-700 font-semibold text-xs leading-none">
          {patient?.userId?.firstName?.[0]}{patient?.userId?.lastName?.[0]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-surface-900">{patientName}</p>
          {isExpiringSoon && (
            <span className="badge badge-warning text-xs">Expires soon</span>
          )}
        </div>
        <p className="text-xs text-surface-500 mt-0.5">{consent.purpose}</p>
        {consent.expiresAt && (
          <p className="text-xs text-surface-400 flex items-center gap-1 mt-1">
            <Calendar className="w-3 h-3" />
            Expires {format(consent.expiresAt)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`badge status-${consent.status}`}>{consent.status}</span>
      </div>
    </Link>
  );
};

export default function DoctorDashboard() {
  const { user } = useAuth();

  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['doctor-consents'],
    queryFn: () => consentService.getDoctorConsents(),
    staleTime: 60 * 1000,
  });

  const pending = consents.filter((c) => c.status === 'PENDING');
  const approved = consents.filter((c) => c.status === 'APPROVED');

  return (
    <DoctorLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Greeting */}
        <div>
          <h1 className="text-xl font-semibold text-surface-900">
            Welcome back, Dr. {user?.lastName}
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage your authorized patients and access requests.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            label="Authorized Patients"
            value={approved.length}
            color="success"
            to="/doctor/patients"
          />
          <StatCard
            icon={ClipboardList}
            label="Pending Requests"
            value={pending.length}
            color="warning"
            to="/doctor/consents"
          />
          <StatCard
            icon={Clock}
            label="Total Consents"
            value={consents.length}
            color="brand"
            to="/doctor/consents"
          />
        </div>

        {/* Pending alerts */}
        {pending.length > 0 && (
          <div className="alert-warning">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">{pending.length} consent request(s) awaiting patient approval</p>
              <p className="text-sm mt-0.5">These requests are pending patient review.</p>
            </div>
          </div>
        )}

        {/* Search CTA */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-surface-900 text-sm">Access a New Patient</h2>
            <p className="text-xs text-surface-500 mt-0.5">
              Search for a patient and submit a consent request. Access requires patient approval.
            </p>
          </div>
          <Link to="/doctor/search" className="btn-primary btn-sm flex-shrink-0">
            <Search className="w-3.5 h-3.5" />
            Find Patient
          </Link>
        </div>

        {/* Authorized patients list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-surface-900">Authorized Patients</h2>
            <Link to="/doctor/patients" className="text-brand-600 text-sm font-medium hover:underline">
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-12 w-full" />)}
            </div>
          ) : approved.length === 0 ? (
            <div className="text-center py-10 text-surface-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No authorized patients yet</p>
              <p className="text-xs mt-1">Request access to start viewing patient records</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 px-2 pb-2">
              {approved.slice(0, 5).map((consent) => (
                <ConsentRow key={consent._id} consent={consent} />
              ))}
            </div>
          )}
        </div>

        {/* Security reminder */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-50 border border-surface-100 text-sm text-surface-500">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning-500" />
          <p>
            <span className="font-medium text-surface-700">Authorization reminder:</span> You may only access
            patient records where explicit patient consent has been granted and is not expired or revoked.
            All access is permanently audited.
          </p>
        </div>
      </div>
    </DoctorLayout>
  );
}
