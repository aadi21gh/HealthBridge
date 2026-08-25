import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { ArrowRight, Stethoscope, Leaf, Zap, ShieldAlert, ChevronRight } from 'lucide-react';

export default function KioskWelcome() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('en');
  const [discipline, setDiscipline] = useState('MODERN_MEDICINE');

  const languages = [
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
    { code: 'mr', label: 'मराठी', sub: 'Marathi' },
  ];

  const pathways = [
    {
      id: 'MODERN_MEDICINE',
      title: 'Modern Medicine',
      titleHi: 'आधुनिक चिकित्सा',
      titleMr: 'आधुनिक वैद्यक',
      desc: 'General physician, specialists, surgery & hospital consultation',
      icon: Stethoscope,
    },
    {
      id: 'AYURVEDA',
      title: 'Ayurveda',
      titleHi: 'आयुर्वेद',
      titleMr: 'आयुर्वेद',
      desc: 'Prakriti, Vikriti, doshic balance & herbal care',
      icon: Leaf,
    },
    {
      id: 'YOGA_NATUROPATHY',
      title: 'Yoga & Naturopathy',
      titleHi: 'योग एवं प्राकृतिक चिकित्सा',
      titleMr: 'योग आणि निसर्गोपचार',
      desc: 'Lifestyle, panchamahabhuta balance & drugless therapy',
      icon: Zap,
    },
    {
      id: 'HOMEOPATHY',
      title: 'Homeopathy',
      titleHi: 'होम्योपैथी',
      titleMr: 'होमिओपॅथी',
      desc: 'Individualized symptom totality & constitutional care',
      icon: ShieldAlert,
    },
  ];

  const handleStart = () => {
    navigate('/kiosk/identify', { state: { language, discipline } });
  };

  const getWelcomeText = () => {
    if (language === 'hi') {
      return {
        title: 'आपका स्वागत है',
        subtitle: 'डॉक्टर से मिलने से पहले अपनी स्वास्थ्य जानकारी दर्ज करें',
        btnText: 'आरंभ करें',
        langLabel: '1. भाषा चुनें',
        pathwayLabel: '2. उपचार मार्ग चुनें',
      };
    }
    if (language === 'mr') {
      return {
        title: 'आपले स्वागत आहे',
        subtitle: 'डॉक्टरांना भेटण्यापूर्वी तुमची आरोग्य माहिती नोंदवा',
        btnText: 'सुरू करा',
        langLabel: '1. भाषा निवडा',
        pathwayLabel: '2. उपचार पद्धती निवडा',
      };
    }
    return {
      title: 'Welcome',
      subtitle: 'Prepare your health information before you see the doctor.',
      btnText: 'Start Health Intake',
      langLabel: '1. Select Language',
      pathwayLabel: '2. Select Your Care Pathway',
    };
  };

  const text = getWelcomeText();

  return (
    <KioskLayout language={language} onLanguageChange={setLanguage} title="Kiosk Reception">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="kiosk-card">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-surface-900 tracking-tight">
              {text.title}
            </h2>
            <p className="text-surface-500 text-lg sm:text-xl mt-3 max-w-lg mx-auto leading-relaxed">
              {text.subtitle}
            </p>
          </div>

          {/* ── 1. Language Selection ─────────────────────────── */}
          <div className="mb-8">
            <p className="meta-label mb-4">{text.langLabel}</p>
            <div className="grid grid-cols-3 gap-3">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`p-4 rounded-xl border-2 font-semibold text-lg transition-colors active:scale-[0.98] ${
                    language === l.code
                      ? 'border-brand-500 bg-brand-50 text-brand-800'
                      : 'border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  <div>{l.label}</div>
                  <div className="text-xs font-normal text-surface-400 mt-0.5">{l.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. Care Pathway ───────────────────────────────── */}
          <div className="mb-10">
            <p className="meta-label mb-4">{text.pathwayLabel}</p>
            <div className="space-y-2">
              {pathways.map((p) => {
                const Icon = p.icon;
                const isSelected = discipline === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setDiscipline(p.id)}
                    className={`kiosk-option-card w-full ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-brand-100' : 'bg-surface-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-surface-500'}`} />
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-base ${isSelected ? 'text-brand-900' : 'text-surface-900'}`}>
                          {language === 'hi' ? p.titleHi : language === 'mr' ? p.titleMr : p.title}
                        </div>
                        <div className="text-sm text-surface-500 mt-0.5 line-clamp-1">{p.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-brand-500' : 'text-surface-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Start Button ──────────────────────────────────── */}
          <button
            onClick={handleStart}
            className="kiosk-btn-primary w-full"
          >
            <span>{text.btnText}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </KioskLayout>
  );
}

