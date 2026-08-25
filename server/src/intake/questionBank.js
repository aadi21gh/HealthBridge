/**
 * Clinical Question Bank — Language-Independent
 *
 * Each question maps to a clinical concept and is referenced by ID.
 * Actual text is provided via translations.
 * Conditional branching determines next question based on previous answers.
 *
 * Input types:
 *   text      — free text
 *   voice     — voice input
 *   select    — single selection from options
 *   multi     — multiple selection
 *   scale     — numeric scale (e.g., pain 1-10)
 *   yesno     — yes/no
 *   date      — date input
 */

const CATEGORIES = {
  CHIEF_COMPLAINT: 'chief_complaint',
  HPI: 'hpi',
  PAST_MEDICAL: 'past_medical',
  PAST_SURGICAL: 'past_surgical',
  MEDICATIONS: 'medications',
  ALLERGIES: 'allergies',
  FAMILY_HISTORY: 'family_history',
  PERSONAL_HISTORY: 'personal_history',
  LIFESTYLE: 'lifestyle',
  REVIEW_OF_SYSTEMS: 'review_of_systems',
  OBSTETRIC_GYNECOLOGICAL: 'obstetric_gynecological',
};

/**
 * Question definition schema:
 * {
 *   id: string,
 *   clinicalConcept: string,
 *   category: string,
 *   inputType: string,
 *   options?: string[],   // for select/multi — keys into translations
 *   scale?: { min, max }, // for scale type
 *   required: boolean,
 *   condition?: (answers) => boolean,  // skip unless condition returns true
 *   followUp?: (answer) => string[],   // dynamic follow-up question IDs
 * }
 */

const questionBank = [
  // ═══ CHIEF COMPLAINT ═══════════════════════════════════════════════════════
  {
    id: 'chief_complaint',
    clinicalConcept: 'chief_complaint',
    category: CATEGORIES.CHIEF_COMPLAINT,
    inputType: 'text',
    required: true,
    condition: null, // Always asked
  },

  // ═══ HPI — History of Present Illness ══════════════════════════════════════
  {
    id: 'hpi_onset',
    clinicalConcept: 'onset',
    category: CATEGORIES.HPI,
    inputType: 'text',
    required: true,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_duration',
    clinicalConcept: 'duration',
    category: CATEGORIES.HPI,
    inputType: 'select',
    optionKeys: ['duration_hours', 'duration_days', 'duration_weeks', 'duration_months', 'duration_years'],
    required: true,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_location',
    clinicalConcept: 'location',
    category: CATEGORIES.HPI,
    inputType: 'text',
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_character',
    clinicalConcept: 'character',
    category: CATEGORIES.HPI,
    inputType: 'text',
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_severity',
    clinicalConcept: 'severity',
    category: CATEGORIES.HPI,
    inputType: 'scale',
    scale: { min: 1, max: 10 },
    required: true,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_timing',
    clinicalConcept: 'timing',
    category: CATEGORIES.HPI,
    inputType: 'select',
    optionKeys: ['timing_constant', 'timing_intermittent', 'timing_morning', 'timing_night', 'timing_after_meals', 'timing_random'],
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_progression',
    clinicalConcept: 'progression',
    category: CATEGORIES.HPI,
    inputType: 'select',
    optionKeys: ['progression_worsening', 'progression_improving', 'progression_same', 'progression_fluctuating'],
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_aggravating',
    clinicalConcept: 'aggravating_factors',
    category: CATEGORIES.HPI,
    inputType: 'text',
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_relieving',
    clinicalConcept: 'relieving_factors',
    category: CATEGORIES.HPI,
    inputType: 'text',
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },
  {
    id: 'hpi_associated',
    clinicalConcept: 'associated_symptoms',
    category: CATEGORIES.HPI,
    inputType: 'multi',
    optionKeys: [
      'symptom_fever', 'symptom_nausea', 'symptom_vomiting', 'symptom_headache',
      'symptom_breathlessness', 'symptom_chest_pain', 'symptom_cough',
      'symptom_diarrhea', 'symptom_constipation', 'symptom_fatigue',
      'symptom_dizziness', 'symptom_sweating', 'symptom_weight_loss',
      'symptom_appetite_loss', 'symptom_none',
    ],
    required: false,
    condition: (answers) => !!answers.chief_complaint?.rawText,
  },

  // ═══ PAST MEDICAL HISTORY ═════════════════════════════════════════════════
  {
    id: 'past_medical_conditions',
    clinicalConcept: 'past_medical_history',
    category: CATEGORIES.PAST_MEDICAL,
    inputType: 'multi',
    optionKeys: [
      'condition_diabetes', 'condition_hypertension', 'condition_heart_disease',
      'condition_asthma', 'condition_thyroid', 'condition_kidney_disease',
      'condition_liver_disease', 'condition_tuberculosis', 'condition_cancer',
      'condition_epilepsy', 'condition_arthritis', 'condition_none',
      'condition_other',
    ],
    required: true,
    condition: null,
  },
  {
    id: 'past_medical_details',
    clinicalConcept: 'past_medical_details',
    category: CATEGORIES.PAST_MEDICAL,
    inputType: 'text',
    required: false,
    condition: (answers) => {
      const val = answers.past_medical_conditions?.structuredValue;
      return Array.isArray(val) && val.length > 0 && !val.includes('condition_none');
    },
  },

  // ═══ PAST SURGICAL HISTORY ════════════════════════════════════════════════
  {
    id: 'past_surgical',
    clinicalConcept: 'past_surgical_history',
    category: CATEGORIES.PAST_SURGICAL,
    inputType: 'yesno',
    required: true,
    condition: null,
  },
  {
    id: 'past_surgical_details',
    clinicalConcept: 'past_surgical_details',
    category: CATEGORIES.PAST_SURGICAL,
    inputType: 'text',
    required: false,
    condition: (answers) => answers.past_surgical?.structuredValue === true,
  },

  // ═══ MEDICATIONS ══════════════════════════════════════════════════════════
  {
    id: 'current_medications',
    clinicalConcept: 'medication_history',
    category: CATEGORIES.MEDICATIONS,
    inputType: 'yesno',
    required: true,
    condition: null,
  },
  {
    id: 'medication_details',
    clinicalConcept: 'medication_details',
    category: CATEGORIES.MEDICATIONS,
    inputType: 'text',
    required: false,
    condition: (answers) => answers.current_medications?.structuredValue === true,
  },

  // ═══ ALLERGIES ════════════════════════════════════════════════════════════
  {
    id: 'known_allergies',
    clinicalConcept: 'allergy_history',
    category: CATEGORIES.ALLERGIES,
    inputType: 'yesno',
    required: true,
    condition: null,
  },
  {
    id: 'allergy_details',
    clinicalConcept: 'allergy_details',
    category: CATEGORIES.ALLERGIES,
    inputType: 'text',
    required: false,
    condition: (answers) => answers.known_allergies?.structuredValue === true,
  },

  // ═══ FAMILY HISTORY ═══════════════════════════════════════════════════════
  {
    id: 'family_history',
    clinicalConcept: 'family_history',
    category: CATEGORIES.FAMILY_HISTORY,
    inputType: 'multi',
    optionKeys: [
      'family_diabetes', 'family_hypertension', 'family_heart_disease',
      'family_cancer', 'family_stroke', 'family_asthma',
      'family_thyroid', 'family_mental_health', 'family_none',
      'family_unknown',
    ],
    required: false,
    condition: null,
  },

  // ═══ PERSONAL HISTORY / LIFESTYLE ══════════════════════════════════════════
  {
    id: 'smoking',
    clinicalConcept: 'smoking_status',
    category: CATEGORIES.LIFESTYLE,
    inputType: 'select',
    optionKeys: ['smoking_never', 'smoking_current', 'smoking_former', 'smoking_prefer_not'],
    required: false,
    condition: null,
  },
  {
    id: 'alcohol',
    clinicalConcept: 'alcohol_use',
    category: CATEGORIES.LIFESTYLE,
    inputType: 'select',
    optionKeys: ['alcohol_never', 'alcohol_occasional', 'alcohol_regular', 'alcohol_former', 'alcohol_prefer_not'],
    required: false,
    condition: null,
  },
  {
    id: 'diet',
    clinicalConcept: 'diet',
    category: CATEGORIES.LIFESTYLE,
    inputType: 'select',
    optionKeys: ['diet_vegetarian', 'diet_non_vegetarian', 'diet_vegan', 'diet_eggetarian', 'diet_other'],
    required: false,
    condition: null,
  },
  {
    id: 'sleep_quality',
    clinicalConcept: 'sleep',
    category: CATEGORIES.LIFESTYLE,
    inputType: 'select',
    optionKeys: ['sleep_good', 'sleep_disturbed', 'sleep_insomnia', 'sleep_excessive'],
    required: false,
    condition: null,
  },

  // ═══ OBSTETRIC/GYNECOLOGICAL (conditional on gender) ══════════════════════
  {
    id: 'menstrual_history',
    clinicalConcept: 'menstrual_history',
    category: CATEGORIES.OBSTETRIC_GYNECOLOGICAL,
    inputType: 'select',
    optionKeys: ['menstrual_regular', 'menstrual_irregular', 'menstrual_menopause', 'menstrual_na'],
    required: false,
    condition: (answers, patientContext) =>
      patientContext?.gender === 'female',
  },
  {
    id: 'pregnancy_status',
    clinicalConcept: 'pregnancy_status',
    category: CATEGORIES.OBSTETRIC_GYNECOLOGICAL,
    inputType: 'select',
    optionKeys: ['pregnancy_yes', 'pregnancy_no', 'pregnancy_unsure', 'pregnancy_na'],
    required: false,
    condition: (answers, patientContext) =>
      patientContext?.gender === 'female',
  },

  // ═══ REVIEW OF SYSTEMS ════════════════════════════════════════════════════
  {
    id: 'ros_additional',
    clinicalConcept: 'review_of_systems',
    category: CATEGORIES.REVIEW_OF_SYSTEMS,
    inputType: 'text',
    required: false,
    condition: null,
  },
];

export { questionBank, CATEGORIES };
export default questionBank;
