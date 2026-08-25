import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute.jsx';

// Public pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard.jsx';
import MedicalTimeline from './pages/patient/MedicalTimeline.jsx';
import ConsentPage from './pages/patient/ConsentPage.jsx';
import AccessHistoryPage from './pages/patient/AccessHistoryPage.jsx';
import RecordsPage from './pages/patient/RecordsPage.jsx';
import MedicationsPage from './pages/patient/MedicationsPage.jsx';
import AllergiesPage from './pages/patient/AllergiesPage.jsx';
import ProfilePage from './pages/patient/ProfilePage.jsx';
import SettingsPage from './pages/patient/SettingsPage.jsx';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import DoctorPatientView from './pages/doctor/DoctorPatientView.jsx';
import DoctorIntakeView from './pages/doctor/DoctorIntakeView.jsx';
import DoctorPatientsPage from './pages/doctor/DoctorPatientsPage.jsx';
import DoctorSearchPage from './pages/doctor/DoctorSearchPage.jsx';
import DoctorConsentsPage from './pages/doctor/DoctorConsentsPage.jsx';
import DoctorAuditPage from './pages/doctor/DoctorAuditPage.jsx';

// Kiosk pages
import KioskWelcome from './pages/kiosk/KioskWelcome.jsx';
import KioskIdentify from './pages/kiosk/KioskIdentify.jsx';
import KioskConsent from './pages/kiosk/KioskConsent.jsx';
import KioskIntake from './pages/kiosk/KioskIntake.jsx';
import KioskDocuments from './pages/kiosk/KioskDocuments.jsx';
import KioskReview from './pages/kiosk/KioskReview.jsx';
import KioskComplete from './pages/kiosk/KioskComplete.jsx';

// Admin pages
import KioskManagement from './pages/admin/KioskManagement.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 401/403 — those are authorization failures
        if (error?.response?.status === 401 || error?.response?.status === 403) return false;
        return failureCount < 2;
      },
    },
  },
});

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
    <div className="bg-white border border-surface-200 rounded-xl p-8 max-w-sm w-full text-center space-y-3 shadow-sm">
      <div className="w-12 h-12 rounded-full bg-danger-50 text-danger-600 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-surface-900">Access Restricted</h2>
      <p className="text-surface-500 text-xs leading-relaxed">You do not have the required clinical authorization or permissions to access this page.</p>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Root redirect ──────────────────────────────────── */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* ── Public routes ──────────────────────────────────── */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ── Patient routes ─────────────────────────────────── */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/timeline"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <MedicalTimeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/consents"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <ConsentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/access-history"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <AccessHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/records"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <RecordsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/medications"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <MedicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/allergies"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <AllergiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/settings"
              element={
                <ProtectedRoute roles={['PATIENT']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* ── Kiosk Dedicated Routes ────────────────────────── */}
            <Route path="/kiosk" element={<KioskWelcome />} />
            <Route path="/kiosk/language" element={<KioskWelcome />} />
            <Route path="/kiosk/identify" element={<KioskIdentify />} />
            <Route path="/kiosk/consent" element={<KioskConsent />} />
            <Route path="/kiosk/intake" element={<KioskIntake />} />
            <Route path="/kiosk/documents" element={<KioskDocuments />} />
            <Route path="/kiosk/review" element={<KioskReview />} />
            <Route path="/kiosk/complete" element={<KioskComplete />} />

            {/* ── Doctor routes ──────────────────────────────────── */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients/:patientId"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorPatientView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/intake/:sessionId"
              element={
                <ProtectedRoute roles={['DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN']}>
                  <DoctorIntakeView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorPatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/search"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorSearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/consents"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorConsentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/audit"
              element={
                <ProtectedRoute roles={['DOCTOR']}>
                  <DoctorAuditPage />
                </ProtectedRoute>
              }
            />

            {/* ── Hospital & Admin ───────────────────────────────── */}
            <Route
              path="/hospital/intake"
              element={
                <ProtectedRoute roles={['HOSPITAL_ADMIN', 'SYSTEM_ADMIN', 'DOCTOR']}>
                  <KioskManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/kiosks"
              element={
                <ProtectedRoute roles={['SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
                  <KioskManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/*"
              element={
                <ProtectedRoute roles={['HOSPITAL_ADMIN']}>
                  <KioskManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={['SYSTEM_ADMIN']}>
                  <KioskManagement />
                </ProtectedRoute>
              }
            />

            {/* ── 404 ──────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
