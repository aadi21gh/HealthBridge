import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout.jsx';
import { intakeService } from '../../services/intakeService.js';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  SkipForward,
  FileText,
  Bot,
  Check,
  X,
} from 'lucide-react';

export default function KioskIntake() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    sessionId,
    language = 'en',
    discipline = 'MODERN_MEDICINE',
    patientName = 'Patient',
    currentQuestion: initialQuestion,
    progress: initialProgress,
  } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion || null);
  const [progress, setProgress] = useState(initialProgress || { percentage: 0 });
  const [session, setSession] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [scaleValue, setScaleValue] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const recognitionRef = useRef(null);

  // Fallback load session if directly navigated
  useEffect(() => {
    if (!sessionId) {
      navigate('/kiosk');
      return;
    }
    const load = async () => {
      try {
        const data = await intakeService.getSession(sessionId);
        setSession(data.session);
        if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
        }
        if (data.progress) setProgress(data.progress);
        if (data.session.redFlags) setRedFlags(data.session.redFlags);
      } catch (err) {
        console.error('Failed to load session', err);
      }
    };
    load();
  }, [sessionId]);

  // Read out question when question changes
  useEffect(() => {
    setTextInput('');
    setSelectedOptions([]);
    setScaleValue(5);
  }, [currentQuestion?.id]);

  // Voice Speech-To-Text Handler
  const toggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => {
        const samples = {
          en: 'I have severe stomach pain for three days.',
          hi: 'मुझे पिछले तीन दिनों से पेट में तेज दर्द हो रहा है।',
          mr: 'मला तीन दिवसांपासून पोटात तीव्र वेदना होत आहेत.',
        };
        setTextInput(samples[language] || samples.en);
        setIsRecording(false);
      }, 2000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setTextInput(transcript);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Text-To-Speech Speaker
  const speakCurrentQuestion = () => {
    if (!currentQuestion?.text) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Submit Answer
  const handleAnswer = async (value, method = 'text') => {
    if (!currentQuestion) return;
    setLoading(true);

    try {
      const userMessage = {
        sender: 'patient',
        text: typeof value === 'object' ? JSON.stringify(value) : String(value),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [
        ...prev,
        { sender: 'assistant', text: currentQuestion.text },
        userMessage,
      ]);

      const res = await intakeService.submitAnswer(sessionId, {
        questionId: currentQuestion.id,
        rawInput: value,
        inputMethod: method,
      });

      if (res.redFlags) setRedFlags(res.redFlags);
      if (res.aiFollowUp) setAiSuggestion(res.aiFollowUp);

      if (res.isFinished || !res.nextQuestion) {
        navigate('/kiosk/documents', {
          state: {
            sessionId,
            language,
            discipline,
            patientName,
            redFlags: res.redFlags || redFlags,
          },
        });
      } else {
        setCurrentQuestion(res.nextQuestion);
        setProgress(res.progress);
      }
    } catch (err) {
      console.error('Answer submission failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => handleAnswer(null, 'skip');
  const handleDontKnow = () => handleAnswer('__dont_know__', 'unknown');
  const handleNotApplicable = () => handleAnswer(null, 'not_applicable');

  return (
    <KioskLayout
      language={language}
      progress={progress}
      redFlags={redFlags}
      title="Clinical Intake"
    >
      <div className="w-full max-w-2xl flex flex-col space-y-4 animate-fade-in">
        {/* ── Main Question Card ───────────────────────────────── */}
        {currentQuestion && (
          <div className="kiosk-card space-y-6">
            {/* Question Header & Audio Speaker */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="badge-neutral badge text-xs font-semibold">
                  {currentQuestion.category?.replace(/_/g, ' ') || 'Clinical Intake'}
                </span>
                {currentQuestion.required && (
                  <span className="text-danger-600 text-xs font-semibold">* Required</span>
                )}
              </div>

              <button
                onClick={speakCurrentQuestion}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isSpeaking
                    ? 'bg-brand-100 text-brand-700 border-brand-300'
                    : 'bg-surface-50 text-surface-600 border-surface-200 hover:bg-surface-100 hover:text-surface-900'
                }`}
                title="Listen to question"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Question Text */}
            <h3 className="text-xl sm:text-2xl font-bold text-surface-900 leading-snug">
              {currentQuestion.text}
            </h3>

            {/* Follow-up Suggestion Banner (if present) */}
            {aiSuggestion && (
              <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 text-xs flex items-center gap-2">
                <Bot className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>Follow-up: "{aiSuggestion}"</span>
              </div>
            )}

            {/* ── Interactive Input Formats ─────────────────────── */}
            <div className="pt-2">
              {/* Option A: Free Text / Voice Input */}
              {currentQuestion.inputType === 'text' && (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={
                      language === 'hi'
                        ? 'यहाँ अपना उत्तर लिखें या माइक दबाएं...'
                        : language === 'mr'
                        ? 'येथे आपले उत्तर लिहा किंवा माइक दाबा...'
                        : 'Type your answer here or tap microphone...'
                    }
                    className="kiosk-input text-base"
                  />

                  <div className="flex gap-2.5">
                    <button
                      onClick={toggleVoice}
                      className={`flex-1 py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition-colors ${
                        isRecording
                          ? 'bg-danger-600 text-white border-danger-700 animate-pulse'
                          : 'bg-surface-100 hover:bg-surface-200 text-surface-800 border-surface-300'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-brand-600" />}
                      <span>{isRecording ? 'Listening (Tap to stop)...' : 'Speak Answer'}</span>
                    </button>

                    <button
                      onClick={() => handleAnswer(textInput, 'text')}
                      disabled={!textInput.trim() || loading}
                      className="kiosk-btn-primary py-3.5 px-6 text-sm"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Option B: Yes / No Fast Touch Buttons */}
              {currentQuestion.inputType === 'yesno' && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAnswer(true, 'selection')}
                    className="py-7 rounded-xl bg-surface-50 border-2 border-surface-200 hover:border-brand-500 hover:bg-brand-50/50 text-surface-900 font-bold text-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6 text-success-600" />
                    <span>{language === 'hi' ? 'हाँ' : language === 'mr' ? 'होय' : 'Yes'}</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(false, 'selection')}
                    className="py-7 rounded-xl bg-surface-50 border-2 border-surface-200 hover:border-surface-400 hover:bg-surface-100 text-surface-700 font-bold text-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-6 h-6 text-surface-400" />
                    <span>{language === 'hi' ? 'नहीं' : language === 'mr' ? 'नाही' : 'No'}</span>
                  </button>
                </div>
              )}

              {/* Option C: Single Selection Card Grid */}
              {currentQuestion.inputType === 'select' && currentQuestion.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleAnswer(opt.key, 'selection')}
                      className="p-4 rounded-xl bg-surface-50 border-2 border-surface-200 hover:border-brand-500 hover:bg-brand-50/50 text-surface-900 font-semibold text-left text-sm transition-colors flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      <ArrowRight className="w-4 h-4 text-surface-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Option D: Multi-Selection Checklist */}
              {currentQuestion.inputType === 'multi' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {currentQuestion.options.map((opt) => {
                      const isChecked = selectedOptions.includes(opt.key);
                      return (
                        <div
                          key={opt.key}
                          onClick={() => {
                            if (opt.key.includes('none')) {
                              setSelectedOptions([opt.key]);
                            } else {
                              const next = isChecked
                                ? selectedOptions.filter((k) => k !== opt.key)
                                : [...selectedOptions.filter((k) => !k.includes('none')), opt.key];
                              setSelectedOptions(next);
                            }
                          }}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-colors flex items-center gap-2.5 ${
                            isChecked
                              ? 'border-brand-600 bg-brand-50 text-brand-950 font-semibold'
                              : 'border-surface-200 bg-surface-50 text-surface-700 hover:border-surface-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border flex items-center justify-center font-bold text-xs ${
                              isChecked
                                ? 'bg-brand-600 border-brand-600 text-white'
                                : 'border-surface-300 bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs sm:text-sm">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleAnswer(selectedOptions, 'selection')}
                    disabled={selectedOptions.length === 0}
                    className="kiosk-btn-primary w-full py-3.5 text-sm"
                  >
                    Confirm Selection ({selectedOptions.length})
                  </button>
                </div>
              )}

              {/* Option E: Pain / Severity 1-10 Touch Scale */}
              {currentQuestion.inputType === 'scale' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-surface-50 p-3 rounded-xl border border-surface-200">
                    <span className="text-surface-500 font-medium text-xs">1 (Mild)</span>
                    <span className="text-2xl font-bold text-brand-700">{scaleValue} / 10</span>
                    <span className="text-danger-600 font-medium text-xs">10 (Severe)</span>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setScaleValue(num)}
                        className={`h-12 rounded-lg font-bold text-base border-2 transition-colors ${
                          scaleValue === num
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'bg-white border-surface-200 text-surface-700 hover:border-surface-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAnswer(scaleValue, 'scale')}
                    className="kiosk-btn-primary w-full py-3.5 text-sm"
                  >
                    Confirm Severity ({scaleValue}/10)
                  </button>
                </div>
              )}
            </div>

            {/* ── Kiosk Quick Controls (Skip, Don't Know, Not Applicable) ── */}
            <div className="pt-4 border-t border-surface-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDontKnow}
                  className="px-3.5 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 border border-surface-200 font-medium"
                >
                  {language === 'hi' ? 'मुझे नहीं पता' : language === 'mr' ? 'मला माहित नाही' : "I don't know"}
                </button>
                <button
                  onClick={handleNotApplicable}
                  className="px-3.5 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 border border-surface-200 font-medium"
                >
                  {language === 'hi' ? 'लागू नहीं' : language === 'mr' ? 'लागू नाही' : 'Not applicable'}
                </button>
              </div>

              {!currentQuestion.required && (
                <button
                  onClick={handleSkip}
                  className="px-3.5 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-700 font-semibold flex items-center gap-1"
                >
                  <span>Skip</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Direct Document Upload Link in Intake ────────────── */}
        <div className="text-center">
          <button
            onClick={() =>
              navigate('/kiosk/documents', {
                state: { sessionId, language, discipline, patientName, redFlags },
              })
            }
            className="inline-flex items-center gap-1.5 text-surface-500 hover:text-brand-600 text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Have medical papers or prescriptions to scan? Click here</span>
          </button>
        </div>
      </div>
    </KioskLayout>
  );
}

