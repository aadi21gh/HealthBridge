import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import PatientLayout from '../../layouts/PatientLayout.jsx';
import {
  ShieldCheck, HeartPulse, Pill, Baby, Activity, FileText, CheckCircle2,
  ExternalLink, Phone, Search, HelpCircle, Sparkles, UserCheck, Landmark,
  Layers, ChevronDown, ChevronUp, AlertCircle, Building2
} from 'lucide-react';

const GOVERNMENT_SCHEMES = [
  {
    id: 'pmjay',
    title: 'Ayushman Bharat PM-JAY',
    fullName: 'Pradhan Mantri Jan Arogya Yojana',
    category: 'insurance',
    tag: 'Flagship National Scheme',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    coverAmount: '₹5,00,000 / Year',
    coverDesc: 'Cashless secondary & tertiary hospitalisation per family',
    description:
      'The world\'s largest government-funded health assurance scheme. Provides completely cashless and paperless access to healthcare services in over 27,000+ empanelled public and private hospitals across India.',
    keyBenefits: [
      '100% cashless hospitalization up to ₹5 Lakhs per family per year',
      'Covers 1,949+ medical procedures including oncology, cardiology, neurosurgery & orthopaedics',
      'No cap on family size, age, or gender',
      'Pre-existing conditions covered from Day 1 without waiting period',
      'Includes 3 days pre-hospitalization and 15 days post-hospitalization expenses',
    ],
    eligibility: [
      'Identified rural and urban households based on SECC 2011 deprivation criteria',
      'Families holding Priority Household (PHH) or Antyodaya Anna Yojana (AAY) ration cards',
      'Senior citizens aged 70+ (under the newly expanded Ayushman Vay Vandana card)',
    ],
    documents: [
      'Aadhaar Card (linked with active mobile number)',
      'Ration Card / Family ID document',
      'PM-JAY Letter / PMJAY ID (if already allotted)',
    ],
    helpline: '14555 / 1800-111-565',
    portalUrl: 'https://mera.pmjay.gov.in',
    portalName: 'Mera PMJAY Portal',
  },
  {
    id: 'abdm',
    title: 'Ayushman Bharat Digital Mission (ABDM)',
    fullName: 'National Digital Health Ecosystem & ABHA Card',
    category: 'digital',
    tag: 'Digital Health ID',
    tagColor: 'bg-brand-50 text-brand-700 border-brand-200',
    coverAmount: 'Digital Health Locker',
    coverDesc: 'Lifelong longitudinal health records & seamless doctor sharing',
    description:
      'Creates an interoperable digital health ecosystem in India. Seamlessly connects your lab diagnostics, prescriptions, discharge summaries, and insurance claims with your 14-digit ABHA (Ayushman Bharat Health Account) Number.',
    keyBenefits: [
      'Unique 14-digit ABHA ID to link medical history across all Indian hospitals',
      'Zero loss of physical medical records — instant digital consent-based sharing',
      '1-click registration at OPD counters via QR code scan (Scan & Share)',
      'Direct integration with HealthBridge patient timeline and consent manager',
    ],
    eligibility: ['All Indian citizens with Aadhaar card or Mobile number'],
    documents: ['Aadhaar Card or Mobile Number for OTP verification'],
    helpline: '1800-11-4477',
    portalUrl: 'https://abha.abdm.gov.in',
    portalName: 'Official ABHA Portal',
  },
  {
    id: 'pmbjp',
    title: 'PM Jan Aushadhi Scheme (PMBJP)',
    fullName: 'Pradhan Mantri Bhartiya Janaushadhi Pariyojana',
    category: 'medicines',
    tag: '50% to 90% Savings',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    coverAmount: '50%–90% Discount',
    coverDesc: 'Affordable WHO-GMP quality generic medicines & surgical items',
    description:
      'Provides quality generic medicines, nutraceuticals, and medical devices at affordable prices through 10,000+ Jan Aushadhi Kendras across every district in India.',
    keyBenefits: [
      'Over 2,046 quality generic medicines and 300+ surgical consumables available',
      'Quality equivalent to expensive branded alternatives tested at NABL-accredited labs',
      'Specialized formulations for chronic conditions: Diabetes, Hypertension, Cardiac, Oncology',
      'Biodegradable Sanitary pads (Suvidha) at just ₹1 per pad',
    ],
    eligibility: ['Open to all Indian citizens with a valid doctor’s prescription'],
    documents: ['Doctor’s Prescription (Physical slip or HealthBridge Digital Prescription)'],
    helpline: '1800-180-8080',
    portalUrl: 'http://janaushadhi.gov.in',
    portalName: 'Jan Aushadhi Kendra Locator',
  },
  {
    id: 'ran-hmcpf',
    title: 'Rashtriya Arogya Nidhi (RAN) & Cancer Fund',
    fullName: 'Health Minister\'s Cancer Patient Fund (HMCPF)',
    category: 'critical',
    tag: 'Critical Illness Grant',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    coverAmount: 'Up to ₹15–50 Lakhs',
    coverDesc: 'One-time financial grant for super-specialty treatment',
    description:
      'Financial assistance to patients living Below Poverty Line (BPL) suffering from major life-threatening diseases, organ transplants, or cancer undergoing treatment at designated Government super-specialty hospitals.',
    keyBenefits: [
      'Financial aid up to ₹15 Lakhs (and up to ₹50 Lakhs for Rare Diseases)',
      'Covers open heart surgery, neurosurgery, kidney/liver transplant, joint replacement & chemotherapy',
      'Funds disbursed directly to the Medical Superintendent of treating government hospital',
    ],
    eligibility: [
      'Patients living below poverty line (BPL)',
      'Undergoing treatment at designated Central Government Hospitals / AIIMS',
      'Patients not covered under PM-JAY or central/state employee medical reimbursement',
    ],
    documents: [
      'BPL Certificate / State Income Certificate (< ₹1.5 Lakh/yr)',
      'Government Hospital Doctor Medical Certificate with cost estimate',
      'Aadhaar Card and Ration Card',
    ],
    helpline: '011-23061980',
    portalUrl: 'https://main.mohfw.gov.in',
    portalName: 'MoHFW Financial Assistance',
  },
  {
    id: 'jssk-pmsma',
    title: 'Janani Shishu Suraksha Karyakram (JSSK)',
    fullName: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
    category: 'maternal',
    tag: 'Mother & Child Care',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    coverAmount: '100% Free Care',
    coverDesc: 'Zero out-of-pocket delivery, C-section, medicines & diagnostics',
    description:
      'Guarantees completely free deliveries including caesarean section, diagnostics, medicines, diet, blood, and transport for all pregnant women and sick infants up to 1 year in public health institutions.',
    keyBenefits: [
      'Zero expense delivery (Normal & C-Section) at all government healthcare centers',
      'Free diagnostics (Ultrasound, Blood test, Urine routine)',
      'Free diet during stay (up to 3 days for normal, 7 days for C-section)',
      'Free transport from home to hospital and drop-back after discharge',
      'Free treatment and diagnostics for sick infants up to 1 year of age',
    ],
    eligibility: ['All pregnant women and sick infants accessing public health facilities'],
    documents: ['Mother and Child Protection (MCP) Card / RCH ID / Aadhaar Card'],
    helpline: '104 (Health Helpline) / 108 (Ambulance)',
    portalUrl: 'https://nhm.gov.in',
    portalName: 'National Health Mission Portal',
  },
  {
    id: 'nikshay',
    title: 'Nikshay Poshan Yojana',
    fullName: 'National Tuberculosis Elimination Programme (NTEP)',
    category: 'disease',
    tag: 'Direct Cash Transfer',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    coverAmount: '₹500 / Month DBT',
    coverDesc: 'Monthly nutritional support credited directly to patient bank accounts',
    description:
      'A Direct Benefit Transfer (DBT) scheme providing financial support of ₹500 per month to all notified TB patients across India for nutritional supplements during their treatment period.',
    keyBenefits: [
      'Direct monthly bank transfer of ₹500 for the entire duration of anti-TB treatment',
      '100% free DOTS diagnostic tests (CBNAAT/Truenat) and anti-tubercular medication',
      'Free digital monitoring and clinical counseling through the Ni-kshay platform',
    ],
    eligibility: ['All patients diagnosed with Tuberculosis notified on the national Ni-kshay portal'],
    documents: ['Aadhaar Card', 'Bank Account Passbook (Aadhaar linked for DBT)', 'TB Notification Number'],
    helpline: '1800-11-6666 (TB Arogya Sathi)',
    portalUrl: 'https://nikshay.in',
    portalName: 'Ni-kshay Portal',
  },
  {
    id: 'state-convergence',
    title: 'State Health Assurance Convergence',
    fullName: 'State Specific Schemes (MJPJAY, Aarogyasri, MAA, Karunya)',
    category: 'state',
    tag: 'State & Central Unified',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    coverAmount: 'Up to ₹5–10 Lakhs',
    coverDesc: 'Integrated state welfare health insurance covering broader criteria',
    description:
      'Co-branded health insurance schemes run jointly by state governments and National Health Authority (NHA) to expand healthcare safety nets to middle-income families, farmers, and unorganized workers.',
    keyBenefits: [
      'Enhanced medical packages covering specialized regional conditions',
      'Extended coverage for APL families and gig workers in partnering states (e.g. Maharashtra, Karnataka, Gujarat, AP/Telangana)',
      'Cashless hospital network spanning both government and premier private tertiary hospitals',
    ],
    eligibility: ['State domicile certificate or State Ration Card (Yellow/Orange/White)'],
    documents: ['State Ration card / Domicile proof', 'Aadhaar Card', 'Income Certificate'],
    helpline: 'State 104 Health Contact Centers',
    portalUrl: 'https://nha.gov.in',
    portalName: 'National Health Authority',
  },
];

const FAQS = [
  {
    q: 'How do I check if my name is in the Ayushman Bharat PM-JAY beneficiary list?',
    a: 'You can verify your eligibility online at mera.pmjay.gov.in using your mobile number or Ration Card number, or visit any nearest Common Service Centre (CSC), government hospital Ayushman Mitra desk, or call toll-free helpline 14555.',
  },
  {
    q: 'Are pre-existing diseases covered under PM-JAY and Government schemes?',
    a: 'Yes! Unlike private health insurance policies that have waiting periods of 2 to 4 years, PM-JAY covers all pre-existing medical conditions from Day 1 of card issuance.',
  },
  {
    q: 'How does HealthBridge connect with ABHA and Government Schemes?',
    a: 'HealthBridge is built strictly in accordance with ABDM guidelines. When you enter your 14-digit ABHA ID in your HealthBridge Profile, all your hospital consultations, prescriptions, and verified intake records are stored securely in your digital health locker and can be shared with empanelled doctors with your explicit consent.',
  },
  {
    q: 'Where can I purchase low-cost generic medicines under PMBJP?',
    a: 'There are over 10,000+ Pradhan Mantri Bhartiya Janaushadhi Kendras operating across India. You can locate your nearest store using the Jan Aushadhi Sugam mobile app or the official portal janaushadhi.gov.in. Present your doctor prescription to purchase quality generic drugs at 50%–90% lower prices.',
  },
  {
    q: 'What is the new Ayushman Vay Vandana Card for senior citizens?',
    a: 'Under the expanded PM-JAY scheme, all Indian citizens aged 70 years and above are eligible for a free ₹5,00,000 annual top-up health coverage, irrespective of their income or family economic status.',
  },
];

export default function GovernmentSchemesPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  // Eligibility Calculator State
  const [incomeGroup, setIncomeGroup] = useState('');
  const [categoryType, setCategoryType] = useState('');
  const [needType, setNeedType] = useState('');
  const [hasSenior, setHasSenior] = useState('no');
  const [calcResult, setCalcResult] = useState(null);

  const categories = [
    { id: 'all', label: 'All Schemes', icon: Layers },
    { id: 'insurance', label: 'Cashless Insurance (PM-JAY)', icon: ShieldCheck },
    { id: 'digital', label: 'Digital Health (ABDM / ABHA)', icon: HeartPulse },
    { id: 'medicines', label: 'Affordable Medicines (PMBJP)', icon: Pill },
    { id: 'critical', label: 'Critical Care & Cancer (RAN)', icon: Activity },
    { id: 'maternal', label: 'Mother & Child Care (JSSK)', icon: Baby },
    { id: 'disease', label: 'TB Nutrition (Nikshay)', icon: FileText },
    { id: 'state', label: 'State Schemes', icon: Landmark },
  ];

  const filteredSchemes = useMemo(() => {
    return GOVERNMENT_SCHEMES.filter((scheme) => {
      const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
      const matchesSearch =
        scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.keyBenefits.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCalculateEligibility = (e) => {
    e.preventDefault();
    const eligible = [];

    // All citizens are eligible for ABDM & PMBJP
    eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'abdm'));
    eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'pmbjp'));

    if (incomeGroup === 'bpl' || categoryType === 'phh' || hasSenior === 'yes') {
      eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'pmjay'));
    }
    if (incomeGroup === 'bpl' && (needType === 'critical' || needType === 'all')) {
      eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'ran-hmcpf'));
    }
    if (needType === 'maternal' || needType === 'all') {
      eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'jssk-pmsma'));
    }
    if (needType === 'tb' || needType === 'all') {
      eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'nikshay'));
    }
    if (categoryType === 'state_card' || incomeGroup === 'low') {
      eligible.push(GOVERNMENT_SCHEMES.find((s) => s.id === 'state-convergence'));
    }

    const uniqueEligible = Array.from(new Set(eligible.filter(Boolean)));
    setCalcResult(uniqueEligible);
  };

  const resetCalculator = () => {
    setIncomeGroup('');
    setCategoryType('');
    setNeedType('');
    setHasSenior('no');
    setCalcResult(null);
  };

  return (
    <PatientLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-surface-900 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-brand-600" />
              <span>Government Health Schemes & Subsidies</span>
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
              Explore ₹5 Lakh annual cashless coverage, generic medicine centers, and healthcare welfare programs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="tel:14555"
              className="btn-secondary btn-sm flex-shrink-0"
              title="Toll-free national health assistance"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Helpline 14555</span>
            </a>
            <a
              href="#eligibility-checker"
              className="btn-primary btn-sm flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Check Eligibility</span>
            </a>
          </div>
        </div>

        {/* ── ABHA Linking Card ───────────────────────────────────── */}
        <div className="bg-white border border-surface-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                <span>Ayushman Bharat Digital Mission (ABDM) Integration</span>
                <span className="badge badge-success text-[10px]">Active Standard</span>
              </p>
              <p className="text-xs text-surface-500 mt-0.5">
                Your 14-digit ABHA ID connects with PM-JAY empanelled hospitals, expediting cashless admission and claims.
              </p>
            </div>
          </div>
          <Link to="/patient/profile" className="btn-secondary btn-sm flex-shrink-0 whitespace-nowrap">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manage ABHA</span>
          </Link>
        </div>

        {/* ── Eligibility Calculator ──────────────────────────────── */}
        <div id="eligibility-checker" className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scheme Eligibility Calculator</span>
          </div>
          <h2 className="text-base font-bold text-surface-900">
            Find Schemes Matching Your Household
          </h2>
          <p className="text-xs text-surface-500 mt-0.5">
            Select your family details below to see all Central and State schemes offering benefits.
          </p>

          {!calcResult ? (
            <form onSubmit={handleCalculateEligibility} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">1. Annual Family Income</label>
                  <select
                    value={incomeGroup}
                    onChange={(e) => setIncomeGroup(e.target.value)}
                    className="input text-xs"
                    required
                  >
                    <option value="">Select Income Bracket...</option>
                    <option value="bpl">Below Poverty Line (BPL / Yellow Ration Card)</option>
                    <option value="low">Under ₹2.5 Lakhs / year</option>
                    <option value="mid">₹2.5 Lakhs – ₹5 Lakhs / year</option>
                    <option value="high">Above ₹5 Lakhs / year</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">2. Category & Ration Card</label>
                  <select
                    value={categoryType}
                    onChange={(e) => setCategoryType(e.target.value)}
                    className="input text-xs"
                    required
                  >
                    <option value="">Select Category...</option>
                    <option value="phh">Priority Household (PHH / Antyodaya AAY)</option>
                    <option value="state_card">State Ration Card (Orange / White)</option>
                    <option value="sc_st">SC / ST / OBC Beneficiary</option>
                    <option value="unorganized">Farmer / Gig Worker / Construction</option>
                    <option value="general">General Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">3. Specific Healthcare Need</label>
                  <select
                    value={needType}
                    onChange={(e) => setNeedType(e.target.value)}
                    className="input text-xs"
                    required
                  >
                    <option value="">Select Primary Need...</option>
                    <option value="all">General Health Protection & Insurance</option>
                    <option value="medicines">Low-Cost Generic Medicines</option>
                    <option value="critical">Major Surgery / Cancer / Organ Transplant</option>
                    <option value="maternal">Pregnancy / Delivery / Infant Care</option>
                    <option value="tb">Tuberculosis (TB) Care & Nutrition</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">4. Any Family Member Aged 70+?</label>
                  <select
                    value={hasSenior}
                    onChange={(e) => setHasSenior(e.target.value)}
                    className="input text-xs"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes (Eligible for ₹5L Ayushman Vay Vandana Card)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" className="btn-primary btn-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Calculate Eligible Schemes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {calcResult.length}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      You Qualify for {calcResult.length} Government Schemes!
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Based on your inputs, these official programs offer financial protection for your household.
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetCalculator}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {calcResult.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="border border-surface-200 rounded-lg p-3 bg-surface-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.tagColor}`}>
                          {scheme.tag}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {scheme.coverAmount}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-surface-900">{scheme.title}</h4>
                      <p className="text-[11px] text-surface-500 mt-0.5 line-clamp-2">{scheme.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-surface-200 flex items-center justify-between text-[11px]">
                      <span className="text-surface-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-brand-600" />
                        {scheme.helpline}
                      </span>
                      <a
                        href={scheme.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>{scheme.portalName}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Search & Filter Catalogue ────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-surface-900">National Schemes Catalogue</h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search schemes, benefits, diseases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-8 text-xs py-1.5"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scheme Cards */}
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:border-surface-300 transition-colors"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-surface-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.tagColor}`}>
                        {scheme.tag}
                      </span>
                      <span className="text-[11px] text-surface-400 font-mono">
                        Category: {scheme.category.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-surface-900">{scheme.title}</h3>
                    <p className="text-xs text-brand-600 font-medium">{scheme.fullName}</p>
                  </div>

                  <div className="bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 text-right sm:flex-shrink-0">
                    <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Coverage Amount</p>
                    <p className="text-sm font-extrabold text-surface-900">{scheme.coverAmount}</p>
                    <p className="text-[10px] text-surface-500">{scheme.coverDesc}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-surface-600 mt-3 leading-relaxed">
                  {scheme.description}
                </p>

                {/* 3-Column Breakdown */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-surface-100 text-xs">
                  {/* Benefits */}
                  <div className="bg-surface-50/60 border border-surface-200/60 rounded-lg p-3">
                    <p className="font-bold text-surface-900 flex items-center gap-1 mb-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Key Benefits
                    </p>
                    <ul className="space-y-1 text-surface-600 text-[11px]">
                      {scheme.keyBenefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Eligibility */}
                  <div className="bg-surface-50/60 border border-surface-200/60 rounded-lg p-3">
                    <p className="font-bold text-surface-900 flex items-center gap-1 mb-1.5">
                      <UserCheck className="w-3 h-3 text-brand-600" />
                      Eligibility
                    </p>
                    <ul className="space-y-1 text-surface-600 text-[11px]">
                      {scheme.eligibility.map((e, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-brand-500 font-bold">•</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Required Documents */}
                  <div className="bg-surface-50/60 border border-surface-200/60 rounded-lg p-3">
                    <p className="font-bold text-surface-900 flex items-center gap-1 mb-1.5">
                      <FileText className="w-3 h-3 text-amber-600" />
                      Documents
                    </p>
                    <ul className="space-y-1 text-surface-600 text-[11px]">
                      {scheme.documents.map((d, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-surface-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-surface-500">
                    <Phone className="w-3 h-3 text-brand-600" />
                    <span>Official Helpline: <strong className="text-surface-900">{scheme.helpline}</strong></span>
                  </div>

                  <a
                    href={scheme.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary btn-sm inline-flex items-center gap-1"
                  >
                    <span>Apply / Verify on {scheme.portalName}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}

            {filteredSchemes.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-surface-200">
                <AlertCircle className="w-7 h-7 text-surface-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-surface-900">No schemes found matching "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="btn-secondary btn-sm mt-3"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── FAQ Section ─────────────────────────────────────────── */}
        <div className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-brand-600 text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Patient FAQs</span>
          </div>
          <h2 className="text-base font-bold text-surface-900">Frequently Asked Questions</h2>
          
          <div className="mt-4 space-y-2">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-surface-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 bg-surface-50/50 hover:bg-surface-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-surface-900">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-surface-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-surface-500 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 py-2.5 bg-white text-xs text-surface-600 border-t border-surface-100 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
