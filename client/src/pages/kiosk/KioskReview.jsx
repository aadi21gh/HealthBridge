import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { intakeService } from '../../services/intakeService.js';
import {
  CheckCircle,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
} from 'lucide-react';

export default function KioskReview() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    sessionId,
    language = 'en',
    discipline = 'MODERN_MEDICINE',
    patientName = 'Patient',
    redFlags = [],
  } = location.state || {};

  const [session, setSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/kiosk');
      return;
    }
    const loadSession = async () => {
      try {
        const data = await intakeService.getSession(sessionId);
        setSession(data.session);
      } catch (err) {
        console.error('Failed to load session for review', err);
      }
    };
    loadSession();
  }, [sessionId]);

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await intakeService.completeSession(sessionId);
      navigate('/kiosk/complete', {
        state: {
          sessionId,
          patientName,
          encounterId: result.encounterId,
          language,
          redFlags: session?.redFlags || redFlags,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit intake. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <KioskLayout language={language} redFlags={session?.redFlags || redFlags} title="Review Answers">
      <div className="w-full max-w-2xl space-y-4 animate-fade-in">
        <div className="kiosk-card space-y-6">
          <div className="flex items-center justify-between border-b border-surface-100 pb-3.5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-surface-900">
                {language === 'hi'
                  ? 'अपनी जानकारी की समीक्षा करें'
                  : language === 'mr'
                  ? 'आपल्या माहितीचे पुनरावलोकन करा'
                  : 'Review Your Intake Summary'}
              </h2>
              <p className="text-surface-500 text-xs mt-0.5">
                Please confirm the details before sending to your doctor
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 flex-shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Patient Card */}
          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-surface-900 font-semibold text-sm">{patientName}</p>
                <p className="text-xs text-surface-400">Care Pathway: {discipline.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <span className="badge-success badge text-[10px]">
              Ready for Doctor
            </span>
          </div>

          {/* Answers Grid */}
          {session?.answers && session.answers.length > 0 && (
            <div className="space-y-2">
              <h4 className="meta-label">Captured Clinical Facts:</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {session.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-50 border border-surface-200 flex items-start justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">
                        {ans.clinicalConcept?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-surface-900 font-medium text-xs mt-0.5 block">
                        {ans.skipped ? '(Skipped / Not reported)' : ans.rawText || String(ans.structuredValue)}
                      </span>
                    </div>
                    <span className="badge-neutral badge text-[9px]">
                      PATIENT REPORTED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Attached */}
          {session?.documentIds && session.documentIds.length > 0 && (
            <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200">
              <div className="flex items-center gap-2 text-surface-900 text-xs font-bold mb-1">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Uploaded Documents ({session.documentIds.length})</span>
              </div>
              <p className="text-xs text-surface-500">
                Original files have been attached for doctor review and verification.
              </p>
            </div>
          )}

          {error && (
            <div className="alert-danger text-xs text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-surface-100 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="kiosk-btn-secondary text-xs py-3 px-4 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="kiosk-btn-primary text-xs py-3.5 px-6 flex items-center gap-2"
            >
              <span>{submitting ? 'Submitting…' : 'Confirm & Send to Doctor'}</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

