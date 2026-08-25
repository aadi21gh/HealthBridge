import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, AlertTriangle, ShieldCheck, PhoneCall } from 'lucide-react';

export default function KioskLayout({
  children,
  language = 'en',
  onLanguageChange,
  progress = null,
  title = 'HealthBridge Intake Kiosk',
  subtitle = 'Please answer the questions to assist your clinician',
  showBackButton = false,
  onBack = null,
  redFlags = [],
}) {
  const navigate = useNavigate();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'हि' },
    { code: 'mr', label: 'म' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900 select-none overflow-x-hidden">
      {/* ── Top Header ────────────────────────────────────────── */}
      <header className="bg-white border-b border-surface-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.5.5 0 0 1 .5.5v5.5H14a.5.5 0 0 1 0 1H8.5V14a.5.5 0 0 1-1 0V8.5H2a.5.5 0 0 1 0-1h5.5V2a.5.5 0 0 1 .5-.5z"/>
              </svg>
            </div>
            <div>
              <span className="text-base font-semibold text-surface-900">HealthBridge</span>
              <span className="ml-2 text-xs text-surface-400 font-medium border border-surface-200 px-1.5 py-0.5 rounded">Kiosk</span>
            </div>
          </div>
          {title && (
            <span className="hidden sm:block text-sm text-surface-500 border-l border-surface-200 pl-3 ml-1">{title}</span>
          )}
        </div>

        {/* Center: Progress Bar */}
        {progress && (
          <div className="hidden md:flex flex-col items-center gap-1 w-48">
            <div className="flex justify-between w-full text-xs text-surface-500">
              <span>Progress</span>
              <span className="font-medium text-surface-700">{progress.percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Right: Language + Staff */}
        <div className="flex items-center gap-2">
          {onLanguageChange && (
            <div className="flex items-center gap-0.5 bg-surface-100 rounded-lg p-0.5 border border-surface-200">
              <Globe className="w-3.5 h-3.5 text-surface-400 mx-1.5" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => onLanguageChange(l.code)}
                  className={`px-2.5 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                    language === l.code
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-surface-500 hover:text-surface-800'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => alert('Hospital staff has been alerted. Assistance is on its way.')}
            className="flex items-center gap-1.5 bg-warning-50 text-warning-700 border border-warning-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-warning-100 transition-colors active:scale-[0.98]"
            title="Call staff for help"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Call Staff</span>
          </button>
        </div>
      </header>

      {/* ── Red Flag Emergency Banner ───────────────────────── */}
      {redFlags && redFlags.length > 0 && (
        <div className="bg-danger-600 text-white px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-base">URGENT — Clinical Safety Notice</p>
              <p className="text-sm text-danger-100 mt-0.5">{redFlags[0].message}</p>
            </div>
          </div>
          <span className="bg-white text-danger-700 font-bold text-xs uppercase px-3 py-1.5 rounded-lg flex-shrink-0">
            Notify Reception
          </span>
        </div>
      )}

      {/* ── Mobile Progress ─────────────────────────────────── */}
      {progress && (
        <div className="md:hidden bg-white border-b border-surface-200 px-5 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-surface-500 flex-shrink-0">{progress.percentage}%</span>
          </div>
        </div>
      )}

      {/* ── Main Kiosk Body ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col justify-center items-center p-5 sm:p-8 md:p-12 max-w-5xl w-full mx-auto">
        {children}
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-surface-200 px-6 py-3 text-xs text-surface-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-success-600" />
          <span>ABDM compliant · End-to-end encrypted</span>
        </div>
        <span>Your responses are reviewed privately by your doctor before consultation.</span>
      </footer>
    </div>
  );
}
