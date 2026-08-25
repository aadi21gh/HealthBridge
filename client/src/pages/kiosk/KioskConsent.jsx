import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { intakeService } from '../../services/intakeService.js';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, User } from 'lucide-react';

export default function KioskConsent() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    language = 'en',
    discipline = 'MODERN_MEDICINE',
    patientId = null,
    patientName = 'Walk-in Patient',
    gender = 'unknown',
    bloodGroup = 'unknown',
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getConsentContent = () => {
    if (language === 'hi') {
      return {
        title: 'गोपनीयता सूचना एवं सहमति',
        patientCard: 'पहचाने गए मरीज़',
        noticeTitle: 'आपकी जानकारी कैसे उपयोग की जाती है',
        noticePoints: [
          'यह जानकारी केवल आपकी चिकित्सा परामर्श की तैयारी के लिए एकत्र की जा रही है।',
          'यह डेटा आपके डॉक्टर और अधिकृत क्लिनिकल टीम द्वारा ही देखा जाएगा।',
          'आपका डेटा भारतीय स्वास्थ्य डेटा मानकों (ABDM) के तहत सुरक्षित रूप से संग्रहीत होगा।',
          'आप किसी भी प्रश्न को छोड़ने या जवाब न देने के लिए स्वतंत्र हैं।',
        ],
        consentPrompt: 'मैं चिकित्सा देखभाल और परामर्श की तैयारी के लिए अपनी स्वास्थ्य जानकारी दर्ज करने की सहमति देता/देती हूँ।',
        agreeBtn: 'सहमति है और आगे बढ़ें',
        declineBtn: 'अस्वीकार करें',
      };
    }
    if (language === 'mr') {
      return {
        title: 'गोपनीयता सूचना आणि संमती',
        patientCard: 'ओळख पटलेले रुग्ण',
        noticeTitle: 'तुमची माहिती कशी वापरली जाते',
        noticePoints: [
          'ही माहिती केवळ तुमच्या वैद्यकीय सल्लामसलतीच्या पूर्वतयारीसाठी गोळा केली जात आहे.',
          'हा डेटा तुमचे डॉक्टर आणि अधिकृत वैद्यकीय कर्मचाऱ्यांद्वारेच पाहिला जाईल.',
          'तुमचा डेटा भारतीय आरोग्य डेटा नियमांनुसार (ABDM) सुरक्षितपणे साठवला जाईल.',
          'तुम्ही कोणताही प्रश्न वगळण्यासाठी किंवा उत्तर न देण्यासाठी स्वतंत्र आहात.',
        ],
        consentPrompt: 'मी वैद्यकीय काळजी आणि सल्लामसलतीच्या पूर्वतयारीसाठी माझी आरोग्य माहिती नोंदवण्यास संमती देतो/देते.',
        agreeBtn: 'संमती आहे आणि पुढे जा',
        declineBtn: 'अस्वीकार करा',
      };
    }
    return {
      title: 'Privacy Notice & Clinical Consent',
      patientCard: 'Identified Patient',
      noticeTitle: 'How Your Information Is Handled',
      noticePoints: [
        'This intake collects your clinical history to prepare your doctor for the consultation.',
        'Data is strictly accessible only to your treating clinician and authorized medical staff.',
        'All records are stored securely in compliance with ABDM and India health privacy principles.',
        'You have the right to skip any question or stop the intake session at any moment.',
      ],
      consentPrompt: 'I understand and voluntarily consent to provide my health history for clinical evaluation.',
      agreeBtn: 'I Agree & Begin Intake',
      declineBtn: 'Decline',
    };
  };

  const text = getConsentContent();

  const handleAgree = async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionResult = await intakeService.startSession({
        patientId,
        language,
        discipline,
        consentGiven: true,
        identificationMethod: patientId ? 'phone' : 'manual',
      });

      navigate('/kiosk/intake', {
        state: {
          sessionId: sessionResult.session._id,
          session: sessionResult.session,
          currentQuestion: sessionResult.currentQuestion,
          progress: sessionResult.progress,
          language,
          discipline,
          patientName,
        },
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to initialize session. Please try again.');
      setLoading(false);
    }
  };

  const handleDecline = () => {
    navigate('/kiosk');
  };

  return (
    <KioskLayout language={language} title="Consent & Privacy">
      <div className="w-full max-w-xl animate-fade-in">
        <div className="kiosk-card space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900">
              {text.title}
            </h2>
          </div>

          {/* Patient confirmation banner */}
          <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="meta-label">{text.patientCard}</p>
              <p className="text-sm font-semibold text-surface-900">{patientName}</p>
            </div>
          </div>

          {/* Notice Points */}
          <div className="space-y-2.5">
            <h4 className="meta-label">
              {text.noticeTitle}
            </h4>
            <div className="space-y-2 bg-surface-50 p-4 rounded-xl border border-surface-200">
              {text.noticePoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                  <p className="text-surface-700 text-xs sm:text-sm leading-relaxed">{pt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consent declaration box */}
          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200">
            <p className="text-xs sm:text-sm text-brand-900 font-medium leading-relaxed text-center">
              "{text.consentPrompt}"
            </p>
          </div>

          {error && (
            <div className="alert-danger text-xs text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDecline}
              disabled={loading}
              className="kiosk-btn-secondary text-base py-3.5"
            >
              <XCircle className="w-4 h-4" />
              <span>{text.declineBtn}</span>
            </button>

            <button
              onClick={handleAgree}
              disabled={loading}
              className="kiosk-btn-primary text-base py-3.5"
            >
              <span>{loading ? 'Starting…' : text.agreeBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
}

