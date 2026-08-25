import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protect a route — redirects to /login if not authenticated.
 * Optionally restrict to specific roles.
 */
export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <p className="text-surface-500 text-sm">Loading HealthBridge…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Redirect authenticated users away from public pages (login/register).
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    const roleRedirect = {
      PATIENT: '/patient/dashboard',
      DOCTOR: '/doctor/dashboard',
      HOSPITAL_ADMIN: '/hospital/dashboard',
      SYSTEM_ADMIN: '/admin/dashboard',
    };
    return <Navigate to={roleRedirect[user.role] || '/'} replace />;
  }

  return children;
};
