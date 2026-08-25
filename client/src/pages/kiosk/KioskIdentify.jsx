import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { intakeService } from '../../services/intakeService.js';
import { Search, Smartphone, Hash, User, ArrowRight, UserPlus } from 'lucide-react';

export default function KioskIdentify() {
  const location = useLocation();
  const navigate = useNavigate();

  const { language = 'en', discipline = 'MODERN_MEDICINE' } = location.state || {};

  const [method, setMethod] = useState('phone'); // 'phone' | 'abha' | 'name'
  const [searchValue, setSearchValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchValue && !nameValue) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {};
      if (method === 'phone') payload.phone = searchValue;
      else if (method === 'abha') payload.abhaId = searchValue;
      else payload.name = nameValue;

      const patients = await intakeService.searchPatient(payload);
      setSearchResults(patients);
      if (patients.length === 0) {
        setError('No patient profile found with these details. You can continue as a new walk-in patient.');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    navigate('/kiosk/consent', {
      state: {
        language,
        discipline,
        patientId: patient?._id || null,
        patientName: patient ? `${patient.firstName} ${patient.lastName || ''}` : 'Walk-in Patient',
        gender: patient?.gender || 'unknown',
        bloodGroup: patient?.bloodGroup || 'unknown',
      },
    });
  };

  const handleWalkIn = () => {
    navigate('/kiosk/consent', {
      state: {
        language,
        discipline,
        patientId: null,
        patientName: nameValue || 'Walk-in Patient',
        isAnonymous: true,
      },
    });
  };

  return (
    <KioskLayout language={language} title="Patient Identification">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="kiosk-card space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900">
              {language === 'hi'
                ? 'अपनी पहचान दर्ज करें'
                : language === 'mr'
                ? 'आपली ओळख नोंदवा'
                : 'Find Your Patient Profile'}
            </h2>
            <p className="text-surface-500 text-sm mt-1">
              {language === 'hi'
                ? 'अपना पंजीकृत मोबाइल नंबर या ABHA आईडी दर्ज करें'
                : language === 'mr'
                ? 'तुमचा नोंदणीकृत मोबाईल क्रमांक किंवा ABHA आयडी टाका'
                : 'Enter your registered Mobile Number, ABHA ID, or Name'}
            </p>
          </div>

          {/* ── Method Tabs ────────────────────────────────────────── */}
          <div className="flex bg-surface-100 p-1 rounded-xl border border-surface-200">
            <button
              onClick={() => {
                setMethod('phone');
                setSearchResults(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                method === 'phone'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </button>
            <button
              onClick={() => {
                setMethod('abha');
                setSearchResults(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                method === 'abha'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>ABHA ID</span>
            </button>
            <button
              onClick={() => {
                setMethod('name');
                setSearchResults(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                method === 'name'
                  ? 'bg-white text-surface-900 shadow-sm'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Name</span>
            </button>
          </div>

          {/* ── Search Input ───────────────────────────────────────── */}
          <form onSubmit={handleSearch} className="space-y-4">
            {method === 'phone' && (
              <div>
                <label className="block text-surface-700 font-medium text-xs mb-1.5">
                  10-Digit Mobile Number
                </label>
                <input
                  type="tel"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="kiosk-input font-mono text-lg"
                  autoFocus
                />
              </div>
            )}

            {method === 'abha' && (
              <div>
                <label className="block text-surface-700 font-medium text-xs mb-1.5">
                  14-Digit ABHA ID or PHR Address
                </label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="e.g. 12-3456-7890-1234 or user@abdm"
                  className="kiosk-input text-base"
                  autoFocus
                />
              </div>
            )}

            {method === 'name' && (
              <div>
                <label className="block text-surface-700 font-medium text-xs mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="kiosk-input text-base"
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="kiosk-btn-primary w-full py-4 text-base font-bold"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Search Patient Profile'}</span>
            </button>
          </form>

          {/* ── Error Banner ───────────────────────────────────────── */}
          {error && (
            <div className="alert-warning text-xs">
              {error}
            </div>
          )}

          {/* ── Results List ───────────────────────────────────────── */}
          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <p className="meta-label">Matching Profiles:</p>
              {searchResults.map((patient) => (
                <div
                  key={patient._id}
                  onClick={() => handleSelectPatient(patient)}
                  className="p-4 rounded-xl bg-surface-50 border-2 border-surface-200 hover:border-brand-500 hover:bg-brand-50/50 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                      {patient.firstName?.[0]}
                      {patient.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-surface-900 text-sm">
                        {patient.firstName} {patient.lastName}
                      </h4>
                      <p className="text-xs text-surface-500">
                        Gender: <span className="capitalize">{patient.gender || 'N/A'}</span> • Blood: {patient.bloodGroup || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button className="btn-primary btn-sm flex items-center gap-1">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── Walk-in / New Visitor Option ────────────────────────── */}
          <div className="pt-4 border-t border-surface-100 text-center">
            <p className="text-xs text-surface-400 mb-2">First visit or not registered yet?</p>
            <button
              onClick={handleWalkIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs font-semibold border border-surface-200 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Continue as Walk-in Patient</span>
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

