import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield, Activity, Stethoscope, Tablet, Landmark, Clock, CheckCircle2,
  Lock, ArrowRight, Sparkles, HeartPulse, UserCheck, ChevronRight, FileText,
  Zap, AlertTriangle, AlertCircle, Phone, Eye, Layers, Building2, Users,
  Mic, Play, Globe, Check, Award
} from 'lucide-react';

export default function HomePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [demoLoading, setDemoLoading] = useState(false);

  const handleQuickLogin = async (email, password, redirectPath) => {
    setDemoLoading(true);
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Quick login failed', err);
      navigate('/login');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── Ambient Background Glows ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[160px]" />
      </div>

      {/* ── Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">HealthBridge</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">
                  ABDM FHIR
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium leading-none -mt-0.5">
                Indian Digital Health Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#portals" className="hover:text-white transition-colors">Portals & Workspaces</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <Link to="/schemes" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              <Landmark className="w-3.5 h-3.5" />
              <span>Govt. Schemes (PM-JAY)</span>
            </Link>
            <a href="#security" className="hover:text-white transition-colors">Security & FHIR</a>
            <a href="#demo-accounts" className="hover:text-white transition-colors">Test Credentials</a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/kiosk"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/80 transition-all"
            >
              <Tablet className="w-3.5 h-3.5 text-cyan-400" />
              <span>OPD Kiosk</span>
            </Link>

            {user ? (
              <Link
                to={
                  user.role === 'PATIENT'
                    ? '/patient/dashboard'
                    : user.role === 'DOCTOR'
                    ? '/doctor/dashboard'
                    : '/admin/kiosks'
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs sm:text-sm font-semibold text-white transition-all shadow-md shadow-brand-600/30"
              >
                <span>Dashboard ({user.firstName})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-xs sm:text-sm font-semibold text-white transition-all shadow-md shadow-brand-600/30"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Hero Section ────────────────────────────────────────── */}
      <section className="relative z-10 pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-200">
              🇮🇳 Aligned with Ayushman Bharat Digital Mission (ABDM) & HL7 FHIR R4
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            India’s Unified, Patient-Controlled <br />
            <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Longitudinal Health Record
            </span> & Smart OPD Intake
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Eliminate lost paper folders and 40-minute OPD triage queues. HealthBridge bridges patients, doctors, and multilingual touchscreen kiosks into one zero-trust, consent-first digital healthcare ecosystem.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleQuickLogin('arjun.kumar@example.com', 'Demo@1234', '/patient/dashboard')}
              disabled={demoLoading}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm sm:text-base transition-all shadow-lg shadow-brand-600/35 hover:-translate-y-0.5"
            >
              <UserCheck className="w-5 h-5" />
              <span>Launch Patient Portal</span>
            </button>

            <button
              onClick={() => handleQuickLogin('dr.sharma@apollodemo.example', 'Demo@1234', '/doctor/dashboard')}
              disabled={demoLoading}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-sm sm:text-base border border-slate-700 transition-all hover:border-slate-600 hover:-translate-y-0.5"
            >
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              <span>Doctor Clinical Workspace</span>
            </button>

            <Link
              to="/kiosk"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-bold text-sm sm:text-base border border-emerald-700/50 transition-all hover:-translate-y-0.5"
            >
              <Tablet className="w-5 h-5 text-emerald-400" />
              <span>Try Touchscreen Kiosk</span>
            </Link>

            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber-950/50 hover:bg-amber-900/70 text-amber-300 font-bold text-sm sm:text-base border border-amber-700/50 transition-all hover:-translate-y-0.5"
            >
              <Landmark className="w-5 h-5 text-amber-400" />
              <span>Govt. Schemes (PM-JAY)</span>
            </Link>
          </div>
        </div>

        {/* ── Interactive Live Experience Simulator Mockup ───────────── */}
        <div className="mt-14 max-w-5xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Mockup Tab Switcher */}
          <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">HealthBridge Live Core Modules</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('patient')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'patient'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Patient Portal
              </button>
              <button
                onClick={() => setActiveTab('doctor')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'doctor'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Doctor Clinical Chart
              </button>
              <button
                onClick={() => setActiveTab('kiosk')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'kiosk'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OPD Kiosk
              </button>
              <button
                onClick={() => setActiveTab('schemes')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeTab === 'schemes'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                PM-JAY & Schemes
              </button>
            </div>
          </div>

          {/* Mockup Preview Area */}
          <div className="p-6 sm:p-8">
            {activeTab === 'patient' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Arjun Kumar</span>
                      <span className="text-xs font-mono bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded border border-brand-500/30">
                        ABHA: 91-4820-1923-8841
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Patient Dashboard · Age 34 · Blood Group O+</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Consent Active (Dr. Sharma)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Critical Allergy Alert
                    </p>
                    <p className="text-sm font-bold text-white">Penicillin G (Severe Anaphylaxis)</p>
                    <p className="text-xs text-slate-500 mt-1">Documented in safety ledger</p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-brand-400 font-semibold flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      Longitudinal Timeline
                    </p>
                    <p className="text-sm font-bold text-white">12 Clinical Encounters</p>
                    <p className="text-xs text-slate-500 mt-1">Cross-hospital FHIR synchronized</p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      Consent Manager
                    </p>
                    <p className="text-sm font-bold text-white">1 Active Grant · 0 Pending</p>
                    <p className="text-xs text-slate-500 mt-1">1-click instant revoke enabled</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link to="/patient/dashboard" className="text-xs text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1">
                    <span>Enter Full Patient Portal</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'doctor' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Dr. Rajesh Sharma, MS</span>
                      <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                        General Surgeon
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Clinical Chart & AI Pre-Consultation Briefing</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                    Urgent Red Flag Flagged (Pain: 8/10)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      AI Verified Intake Facts
                    </p>
                    <div className="space-y-1 text-xs text-slate-300">
                      <p>• Severe right lower abdominal pain (Duration: 36 hrs)</p>
                      <p>• Accompanied by low-grade fever (100.4°F) & nausea</p>
                      <p>• Patient completed intake via Hindi Voice Dictation</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      OCR Paper Slip Digitizer
                    </p>
                    <p className="text-xs text-slate-300">
                      Ultrasound Report scanned at OPD kiosk: <br />
                      <span className="text-white font-mono">"Acute appendicitis with periappendiceal inflammation."</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link to="/doctor/dashboard" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                    <span>Enter Doctor Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'kiosk' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Touchscreen OPD Kiosk Terminal #01</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                        OPD Waiting Hall
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Trilingual Voice & Touch Pre-Consultation Check-in</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
                    Auto-Purge 120s
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <Globe className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white">English · हिंदी · मराठी</p>
                    <p className="text-[11px] text-slate-500 mt-1">Multi-dialect voice recognition</p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <Mic className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white">Speech-to-Text Dictation</p>
                    <p className="text-[11px] text-slate-500 mt-1">Zero typing required for elders</p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <Lock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-white">Ephemeral Sandboxing</p>
                    <p className="text-[11px] text-slate-500 mt-1">100% memory wipe post session</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link to="/kiosk" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                    <span>Launch Live Kiosk Terminal Demo</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'schemes' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Ayushman Bharat PM-JAY & National Schemes</span>
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        ₹5,00,000 Cover
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Integrated citizen welfare eligibility & Jan Aushadhi generic drug lookup</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    27,000+ Empanelled Hosp.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-emerald-400 font-bold mb-1">PM-JAY Health Cover</p>
                    <p className="text-lg font-extrabold text-white">₹5 Lakhs / Year</p>
                    <p className="text-[11px] text-slate-400 mt-1">100% cashless hospitalization per family</p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-blue-400 font-bold mb-1">Jan Aushadhi (PMBJP)</p>
                    <p className="text-lg font-extrabold text-white">50%–90% Off</p>
                    <p className="text-[11px] text-slate-400 mt-1">2,000+ quality generic drugs across India</p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-rose-400 font-bold mb-1">Cancer & Rare Disease</p>
                    <p className="text-lg font-extrabold text-white">Up to ₹50 Lakhs</p>
                    <p className="text-[11px] text-slate-400 mt-1">Rashtriya Arogya Nidhi super-specialty grants</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end">
                  <Link to="/schemes" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                    <span>Explore Schemes & Calculate Eligibility</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Key Impact Stats ─────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-slate-800/80 bg-slate-900/50 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl sm:text-5xl font-extrabold text-brand-400 font-mono tracking-tight">60%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Faster OPD Intake</p>
            <p className="text-[11px] text-slate-500">Automated pre-consultation triage</p>
          </div>

          <div>
            <p className="text-3xl sm:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">100%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Patient-Controlled</p>
            <p className="text-[11px] text-slate-500">ABDM granular time & scope consent</p>
          </div>

          <div>
            <p className="text-3xl sm:text-5xl font-extrabold text-cyan-400 font-mono tracking-tight">0%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Lost Medical Records</p>
            <p className="text-[11px] text-slate-500">Lifelong longitudinal timeline</p>
          </div>

          <div>
            <p className="text-3xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">3+</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">Indian Languages</p>
            <p className="text-[11px] text-slate-500">English, हिंदी, मराठी voice & touch</p>
          </div>
        </div>
      </section>

      {/* ── Core Portals Showcase ────────────────────────────────────── */}
      <section id="portals" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Integrated Clinical Portals</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for Patients, Doctors & Hospital Fleets
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Four specialized workspaces engineered with sub-second responsiveness, clinical safety guardrails, and role-based permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Patient */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/50 hover:bg-slate-900 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Patient Portal</h3>
              <p className="text-xs text-brand-400 font-semibold mb-3">`/patient/*`</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lifelong longitudinal health timeline, diagnostic document vault, real-time consent approval & revoke manager, and critical drug allergy ledger.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleQuickLogin('arjun.kumar@example.com', 'Demo@1234', '/patient/dashboard')}
                className="text-xs font-bold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
              >
                <span>Demo Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Doctor */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-slate-900 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Doctor Workspace</h3>
              <p className="text-xs text-cyan-400 font-semibold mb-3">`/doctor/*`</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive clinical chart, AI-assisted intake fact verification, acute red-flag alerts, OCR paper slip viewer, and emergency break-glass override.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleQuickLogin('dr.sharma@apollodemo.example', 'Demo@1234', '/doctor/dashboard')}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
              >
                <span>Doctor Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Kiosk */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-slate-900 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Tablet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Touchscreen Kiosk</h3>
              <p className="text-xs text-emerald-400 font-semibold mb-3">`/kiosk`</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multilingual voice dictation & touch intake at OPD waiting zones, 1–10 visual pain scale, physical paper upload, and ephemeral session auto-purge.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <Link
                to="/kiosk"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>Launch Kiosk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Fleet Admin */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/50 hover:bg-slate-900 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Hospital Fleet Admin</h3>
              <p className="text-xs text-purple-400 font-semibold mb-3">`/admin/kiosks`</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hospital terminal registry, live status & heartbeat telemetry, OPD intake throughput analytics, and cryptographic device provisioning.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleQuickLogin('admin@healthbridge.example', 'Demo@1234', '/admin/kiosks')}
                className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                <span>Admin Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Government Schemes Feature Spotlight ─────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-brand-950/80 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Landmark className="w-3.5 h-3.5" />
                <span>Citizen Health Welfare & Subsidies</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Government Health Schemes & PM-JAY Benefits
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Empowering patients with information on ₹5 Lakh annual cashless coverage (Ayushman Bharat PM-JAY), 50%–90% savings on generic medicines (Jan Aushadhi), super-specialty cancer funds (RAN), and free maternal care.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Instant Scheme Eligibility Calculator</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Jan Aushadhi Generic Medicine Kendra Locator</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Document Checklist & Official Apply Links</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Direct ABHA 14-Digit Health ID Linking</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center">
              <Link
                to="/schemes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5"
              >
                <span>Explore Government Schemes</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-xs text-slate-400 mt-2 text-center lg:text-right">
                Toll-free National Helpline: <strong className="text-emerald-300">14555</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works (3 Steps) ───────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">The Seamless Workflow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How HealthBridge Works in 3 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A frictionless journey from hospital arrival to doctor consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative">
            <div className="text-5xl font-black text-slate-800 mb-4 font-mono">01</div>
            <h3 className="text-lg font-bold text-white mb-2">OPD Kiosk Check-in</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Patient arrives at hospital waiting hall, chooses their preferred language (English/Hindi/Marathi), and speaks or taps their symptoms. Scans previous paper prescriptions with OCR.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative border-t-2 border-t-brand-500">
            <div className="text-5xl font-black text-brand-900/60 mb-4 font-mono">02</div>
            <h3 className="text-lg font-bold text-white mb-2">Consent-First Verification</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Doctor requests time-bound access to relevant clinical records. Patient grants permission with 1-click on their phone. Zero medical data is exposed without explicit consent.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative">
            <div className="text-5xl font-black text-slate-800 mb-4 font-mono">03</div>
            <h3 className="text-lg font-bold text-white mb-2">Actionable Clinical Care</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Doctor reviews verified intake facts, flags, and lifelong longitudinal timeline. Faster, high-precision diagnosis without redundant lab tests.
            </p>
          </div>
        </div>
      </section>

      {/* ── Emergency Break-Glass Section ────────────────────────────── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Life-Saving ER Protocol</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Emergency "Break-Glass" Access
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When an unconscious trauma patient arrives at the emergency room, strict consent cannot delay critical care. HealthBridge enables certified doctors to unlock emergency charts with mandatory clinical justification, creating an immutable high-priority audit event.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 w-full lg:w-80 flex-shrink-0 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>Emergency Audit Record</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Reason: <span className="text-slate-200">"Acute Trauma ER — Unconscious"</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Doctor: <span className="text-slate-200">Dr. Rajesh Sharma, MS</span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Audit Hash: 0x9f82...3a1c (Permanent)
            </p>
          </div>
        </div>
      </section>

      {/* ── Security & Standards Architecture ────────────────────────── */}
      <section id="security" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Healthcare Engineering</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for National Scale, Security & Privacy
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <Shield className="w-6 h-6 text-brand-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">HL7 FHIR R4</h4>
            <p className="text-xs text-slate-400">Interoperable clinical models for Encounters, Conditions, Observations & Diagnostics.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <Lock className="w-6 h-6 text-cyan-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Argon2id & JWT</h4>
            <p className="text-xs text-slate-400">Cryptographically hardened memory-cost password hashing with HTTP-only sliding refresh tokens.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <Zap className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Consent Gate</h4>
            <p className="text-xs text-slate-400">Database layer validates active, non-expired patient consent before returning any medical data.</p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <Tablet className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Ephemeral Kiosks</h4>
            <p className="text-xs text-slate-400">Public terminal memory automatically wiped after intake completion or idle countdown.</p>
          </div>
        </div>
      </section>

      {/* ── Demo Accounts Quick Launch ───────────────────────────────── */}
      <section id="demo-accounts" className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">1-Click Test Drive</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Pre-Seeded Demo Test Personas
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Standard Password: <code className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 font-mono">Demo@1234</code>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickLogin('arjun.kumar@example.com', 'Demo@1234', '/patient/dashboard')}
            className="bg-slate-900/80 border border-slate-800 hover:border-brand-500 p-4 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-brand-400">Patient</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">Arjun Kumar</p>
            <p className="text-xs text-slate-400 font-mono">arjun.kumar@example.com</p>
            <p className="text-[11px] text-slate-500 mt-1">Surgical history, penicillin allergy & active consent</p>
          </button>

          <button
            onClick={() => handleQuickLogin('dr.sharma@apollodemo.example', 'Demo@1234', '/doctor/dashboard')}
            className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500 p-4 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-cyan-400">Doctor (Surgeon)</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">Dr. Rajesh Sharma</p>
            <p className="text-xs text-slate-400 font-mono">dr.sharma@apollodemo.example</p>
            <p className="text-[11px] text-slate-500 mt-1">Review verified intake briefing & patient chart</p>
          </button>

          <button
            onClick={() => handleQuickLogin('priya.patel@example.com', 'Demo@1234', '/patient/dashboard')}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500 p-4 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-400">Patient</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">Priya Patel</p>
            <p className="text-xs text-slate-400 font-mono">priya.patel@example.com</p>
            <p className="text-[11px] text-slate-500 mt-1">Thyroid condition & incoming pending consent request</p>
          </button>

          <button
            onClick={() => handleQuickLogin('dr.mehta@apollodemo.example', 'Demo@1234', '/doctor/dashboard')}
            className="bg-slate-900/80 border border-slate-800 hover:border-amber-500 p-4 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-400">Doctor (Cardiologist)</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">Dr. Ananya Mehta</p>
            <p className="text-xs text-slate-400 font-mono">dr.mehta@apollodemo.example</p>
            <p className="text-[11px] text-slate-500 mt-1">Request granular 24-hour access scopes</p>
          </button>

          <button
            onClick={() => handleQuickLogin('ramesh.singh@example.com', 'Demo@1234', '/patient/dashboard')}
            className="bg-slate-900/80 border border-slate-800 hover:border-rose-500 p-4 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400">Patient</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">Ramesh Singh</p>
            <p className="text-xs text-slate-400 font-mono">ramesh.singh@example.com</p>
            <p className="text-[11px] text-slate-500 mt-1">Diabetic history & Emergency Break-Glass test</p>
          </button>

          <button
            onClick={() => handleQuickLogin('admin@healthbridge.example', 'Demo@1234', '/admin/kiosks')}
            className="bg-slate-900/80 border border-slate-800 hover:border-purple-500 p-4 rounded-xl text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-400">Hospital Admin</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <p className="text-sm font-bold text-white">System Admin</p>
            <p className="text-xs text-slate-400 font-mono">admin@healthbridge.example</p>
            <p className="text-[11px] text-slate-500 mt-1">Manage 4 hospital kiosks & live throughput stats</p>
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">HealthBridge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified, Patient-Controlled Longitudinal Health Record & OPD Smart Intake Platform for India.
            </p>
            <p className="text-[11px] text-slate-500">
              Aligned with Ayushman Bharat Digital Mission (ABDM) & National Health Authority (NHA).
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Portals & Access</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/patient/dashboard" className="hover:text-white">Patient Portal</Link></li>
              <li><Link to="/doctor/dashboard" className="hover:text-white">Doctor Workspace</Link></li>
              <li><Link to="/kiosk" className="hover:text-white">OPD Touchscreen Kiosk</Link></li>
              <li><Link to="/admin/kiosks" className="hover:text-white">Hospital Fleet Admin</Link></li>
              <li><Link to="/schemes" className="text-emerald-400 hover:text-emerald-300 font-semibold">Government Schemes (PM-JAY)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Healthcare Standards</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span>HL7 FHIR R4 Protocol</span></li>
              <li><span>Ayushman Bharat Health Account (ABHA)</span></li>
              <li><span>Argon2id Cryptographic Security</span></li>
              <li><span>Zero-Knowledge Consent Gate</span></li>
              <li><span>Immutable Audit Ledger</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Emergency & Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span>National Ambulance: <strong className="text-white font-mono">108</strong></span></li>
              <li><span>National Health Helpline: <strong className="text-white font-mono">104</strong></span></li>
              <li><span>PM-JAY Toll-Free: <strong className="text-white font-mono">14555</strong></span></li>
              <li><span>Jan Aushadhi Helpline: <strong className="text-white font-mono">1800-180-8080</strong></span></li>
              <li><Link to="/login" className="text-brand-400 hover:underline">Staff Sign In →</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} HealthBridge Platform. Built as reference clinical infrastructure.</p>
          <div className="flex items-center gap-4">
            <Link to="/schemes" className="hover:text-slate-300">Govt Schemes</Link>
            <Link to="/kiosk" className="hover:text-slate-300">OPD Kiosk</Link>
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
