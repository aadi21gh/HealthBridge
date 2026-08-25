import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Users, ClipboardList, UserSearch, History,
  LogOut, Menu, X, Stethoscope, Shield,
} from 'lucide-react';

const navItems = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor/patients', icon: Users, label: 'My Patients' },
  { to: '/hospital/intake', icon: ClipboardList, label: 'Kiosk Intakes' },
  { to: '/doctor/search', icon: UserSearch, label: 'Patient Search' },
  { to: '/doctor/consents', icon: Shield, label: 'Access Requests' },
  { to: '/doctor/audit', icon: History, label: 'Audit Trail' },
];

export default function DoctorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-surface-200 z-30
          flex flex-col transition-transform duration-200
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-surface-200">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-surface-900 text-sm leading-tight">HealthBridge</p>
            <p className="text-xs text-surface-400 leading-tight">Clinical Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded text-surface-400 hover:text-surface-600 hover:bg-surface-100"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User identity */}
        <div className="px-4 py-3 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-700 font-semibold text-xs leading-none">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate leading-tight">
                Dr. {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-surface-400 leading-tight">Clinician</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-2 py-3 border-t border-surface-100">
          <button onClick={handleLogout} className="sidebar-link w-full text-danger-600 hover:bg-danger-50 hover:text-danger-700">
            <LogOut className="icon" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="bg-white border-b border-surface-200 px-4 py-3 flex items-center gap-3 flex-shrink-0 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md text-surface-500 hover:text-surface-900 hover:bg-surface-100"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-surface-900 text-sm">HealthBridge</span>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
