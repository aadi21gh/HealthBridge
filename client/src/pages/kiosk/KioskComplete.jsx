import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function KioskComplete() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    patientName = 'Patient',
    language = 'en',
    redFlags = [],
  } = location.state || {};

  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Clear all sensitive session state from local kiosk memory
    sessionStorage.clear();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/kiosk');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <KioskLayout language={language} title="Intake Complete">
      <div className="w-full max-w-lg text-center space-y-6 animate-fade-in">
        <div className="kiosk-card flex flex-col items-center p-8 sm:p-10 space-y-5">
          <div className="w-16 h-16 rounded-full bg-success-50 border-2 border-success-200 flex items-center justify-center text-success-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900">
              {language === 'hi'
                ? 'आपकी जानकारी सफलतापूर्वक दर्ज हो गई है!'
                : language === 'mr'
                ? 'तुमची माहिती यशस्वीरित्या नोंदवली गेली आहे!'
                : 'Intake Completed Successfully'}
            </h2>

            <p className="text-surface-600 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              {language === 'hi'
                ? 'कृपया प्रतीक्षा क्षेत्र में बैठें। डॉक्टर आपकी जानकारी देखकर आपको बुलाएंगे।'
                : language === 'mr'
                ? 'कृपया प्रतीक्षा कक्षात बसा. डॉक्टर तुमची माहिती तपासून तुम्हाला बोलावतील.'
                : 'Please proceed to the OPD waiting area. Your doctor will review your clinical briefing before calling your token.'}
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 rounded-lg bg-surface-50 border border-surface-200 w-full flex items-center justify-center gap-2 text-xs text-surface-500">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Kiosk session memory has been securely cleared for your privacy.</span>
          </div>

          {/* Auto reset counter */}
          <div className="text-xs text-surface-400">
            Returning to welcome screen in{' '}
            <span className="font-bold text-surface-800 tabular-nums">{countdown}s</span>
          </div>

          <button
            onClick={() => navigate('/kiosk')}
            className="kiosk-btn-primary w-full py-3.5 text-sm"
          >
            <span>Finish & Return to Start</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </KioskLayout>
  );
}

