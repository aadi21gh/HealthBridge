/**
 * English Translation Pack
 * Maps question IDs and option keys to English text.
 */
const en = {
  // ── Language metadata ──────────────────────────────────────────────────────
  _meta: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },

  // ── UI strings ─────────────────────────────────────────────────────────────
  ui: {
    welcome_title: 'Welcome to HealthBridge',
    welcome_subtitle: 'Your health intake assistant',
    start_button: 'Start',
    select_language: 'Select Language',
    next: 'Next',
    back: 'Back',
    skip: 'Skip',
    done: 'Done',
    submit: 'Submit',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    i_dont_know: "I don't know",
    i_dont_remember: "I don't remember",
    not_applicable: 'Not applicable',
    repeat_question: 'Repeat question',
    clarify: 'Can you clarify?',
    speak_now: 'Speak now...',
    listening: 'Listening...',
    tap_to_speak: 'Tap to speak',
    type_here: 'Type your answer here...',
    scan_document: 'Scan Document',
    upload_document: 'Upload Document',
    take_photo: 'Take Photo',
    review_answers: 'Review Your Answers',
    confirm_submit: 'Confirm & Submit',
    session_complete: 'Thank you! Your information has been recorded.',
    session_complete_detail: 'The clinical team will review your information before your consultation.',
    select_care_pathway: 'Select your care pathway',
    modern_medicine: 'Modern Medicine',
    ayurveda: 'Ayurveda',
    yoga_naturopathy: 'Yoga & Naturopathy',
    unani: 'Unani',
    siddha: 'Siddha',
    homeopathy: 'Homeopathy',
    privacy_title: 'Privacy Notice',
    privacy_text: 'We collect your health information to help your doctor prepare for your consultation. Your data will be reviewed by the clinical team and stored securely as part of your medical record. You may choose not to answer any question.',
    consent_text: 'I understand and consent to the collection of my health information for clinical care.',
    consent_agree: 'I Agree',
    consent_decline: 'I Decline',
    identify_title: 'Let\'s find your profile',
    identify_phone: 'Phone Number',
    identify_abha: 'ABHA ID',
    identify_name: 'Full Name',
    identify_dob: 'Date of Birth',
    search: 'Search',
    patient_not_found: 'Patient not found. Please check your details.',
    severity_scale: 'On a scale of 1-10, how severe is it?',
    red_flag_patient: 'Your responses indicate symptoms that require prompt clinical evaluation. Please inform the clinical staff.',
    uploading: 'Uploading...',
    processing: 'Processing...',
    document_uploaded: 'Document uploaded successfully',
    document_types: 'What type of document is this?',
  },

  // ── Question text ──────────────────────────────────────────────────────────
  questions: {
    chief_complaint: 'What is your main problem today?',
    hpi_onset: 'When did this problem start?',
    hpi_duration: 'How long have you had this problem?',
    hpi_location: 'Where exactly do you feel the problem?',
    hpi_character: 'Can you describe what the problem feels like?',
    hpi_severity: 'On a scale of 1 to 10, how bad is the problem?',
    hpi_timing: 'When does the problem usually occur?',
    hpi_progression: 'Has the problem been getting better, worse, or staying the same?',
    hpi_aggravating: 'What makes the problem worse?',
    hpi_relieving: 'What makes the problem better?',
    hpi_associated: 'Do you have any of these other symptoms?',
    past_medical_conditions: 'Do you have any of these conditions?',
    past_medical_details: 'Please provide more details about your conditions.',
    past_surgical: 'Have you had any surgeries in the past?',
    past_surgical_details: 'Please describe your previous surgeries and when they were done.',
    current_medications: 'Are you currently taking any medications?',
    medication_details: 'Please list your current medications and dosages.',
    known_allergies: 'Do you have any known allergies?',
    allergy_details: 'Please describe your allergies and any reactions you have had.',
    family_history: 'Does anyone in your family have these conditions?',
    smoking: 'Do you smoke or use tobacco?',
    alcohol: 'Do you consume alcohol?',
    diet: 'What is your dietary preference?',
    sleep_quality: 'How is your sleep?',
    menstrual_history: 'How are your menstrual cycles?',
    pregnancy_status: 'Are you currently pregnant?',
    ros_additional: 'Is there anything else about your health you would like to mention?',
  },

  // ── Option labels ──────────────────────────────────────────────────────────
  options: {
    // Duration
    duration_hours: 'A few hours',
    duration_days: 'A few days',
    duration_weeks: 'A few weeks',
    duration_months: 'A few months',
    duration_years: 'More than a year',

    // Timing
    timing_constant: 'Constant',
    timing_intermittent: 'Comes and goes',
    timing_morning: 'Mostly in the morning',
    timing_night: 'Mostly at night',
    timing_after_meals: 'After meals',
    timing_random: 'Random',

    // Progression
    progression_worsening: 'Getting worse',
    progression_improving: 'Getting better',
    progression_same: 'Staying the same',
    progression_fluctuating: 'Fluctuating',

    // Associated symptoms
    symptom_fever: 'Fever',
    symptom_nausea: 'Nausea',
    symptom_vomiting: 'Vomiting',
    symptom_headache: 'Headache',
    symptom_breathlessness: 'Breathlessness',
    symptom_chest_pain: 'Chest pain',
    symptom_cough: 'Cough',
    symptom_diarrhea: 'Diarrhea',
    symptom_constipation: 'Constipation',
    symptom_fatigue: 'Fatigue',
    symptom_dizziness: 'Dizziness',
    symptom_sweating: 'Sweating',
    symptom_weight_loss: 'Weight loss',
    symptom_appetite_loss: 'Loss of appetite',
    symptom_none: 'None of these',

    // Past medical conditions
    condition_diabetes: 'Diabetes',
    condition_hypertension: 'High blood pressure',
    condition_heart_disease: 'Heart disease',
    condition_asthma: 'Asthma',
    condition_thyroid: 'Thyroid disorder',
    condition_kidney_disease: 'Kidney disease',
    condition_liver_disease: 'Liver disease',
    condition_tuberculosis: 'Tuberculosis',
    condition_cancer: 'Cancer',
    condition_epilepsy: 'Epilepsy',
    condition_arthritis: 'Arthritis',
    condition_none: 'None of these',
    condition_other: 'Other',

    // Family history
    family_diabetes: 'Diabetes',
    family_hypertension: 'High blood pressure',
    family_heart_disease: 'Heart disease',
    family_cancer: 'Cancer',
    family_stroke: 'Stroke',
    family_asthma: 'Asthma',
    family_thyroid: 'Thyroid disorder',
    family_mental_health: 'Mental health conditions',
    family_none: 'None of these',
    family_unknown: 'Unknown',

    // Smoking
    smoking_never: 'Never',
    smoking_current: 'Currently smoking',
    smoking_former: 'Former smoker',
    smoking_prefer_not: 'Prefer not to say',

    // Alcohol
    alcohol_never: 'Never',
    alcohol_occasional: 'Occasionally',
    alcohol_regular: 'Regularly',
    alcohol_former: 'Used to, not anymore',
    alcohol_prefer_not: 'Prefer not to say',

    // Diet
    diet_vegetarian: 'Vegetarian',
    diet_non_vegetarian: 'Non-vegetarian',
    diet_vegan: 'Vegan',
    diet_eggetarian: 'Eggetarian',
    diet_other: 'Other',

    // Sleep
    sleep_good: 'Good',
    sleep_disturbed: 'Disturbed',
    sleep_insomnia: 'Difficulty sleeping',
    sleep_excessive: 'Excessive sleep',

    // Menstrual
    menstrual_regular: 'Regular',
    menstrual_irregular: 'Irregular',
    menstrual_menopause: 'Menopause',
    menstrual_na: 'Not applicable',

    // Pregnancy
    pregnancy_yes: 'Yes',
    pregnancy_no: 'No',
    pregnancy_unsure: 'Not sure',
    pregnancy_na: 'Not applicable',
  },

  // ── Red flag messages ──────────────────────────────────────────────────────
  redFlags: {
    urgent_chest_pain: 'Your responses indicate symptoms that require prompt clinical evaluation. Please inform the clinical staff immediately.',
    urgent_neurological: 'Your responses indicate symptoms that may require urgent neurological assessment. Please inform the clinical staff.',
    urgent_breathing: 'Your breathing symptoms require prompt clinical evaluation. Please inform the clinical staff.',
    attention_abdominal: 'Your abdominal symptoms require clinical evaluation. The clinical staff will be informed.',
    urgent_pregnancy: 'Your symptoms during pregnancy require immediate clinical attention. Please inform the clinical staff.',
  },

  // ── Document types ─────────────────────────────────────────────────────────
  documentTypes: {
    LAB_REPORT: 'Lab Report',
    IMAGING_REPORT: 'Imaging/X-Ray/Scan Report',
    DISCHARGE_SUMMARY: 'Discharge Summary',
    PRESCRIPTION: 'Prescription',
    SURGICAL_REPORT: 'Surgical Report',
    CONSULTATION_NOTE: 'Consultation Note',
    OPD_NOTE: 'OPD Note',
    MEDICAL_CERTIFICATE: 'Medical Certificate',
    OTHER: 'Other Document',
  },

  // ── AYUSH terms ────────────────────────────────────────────────────────────
  ayush: {
    prakriti: 'Prakriti (Constitution)',
    vikriti: 'Vikriti (Current Imbalance)',
    agni: 'Agni (Digestive Fire)',
    koshta: 'Koshta (Bowel Habit)',
    ahara: 'Ahara (Diet Pattern)',
    vihara: 'Vihara (Daily Routine)',
    nidra: 'Nidra (Sleep Pattern)',
    prakriti_vata: 'Vata',
    prakriti_pitta: 'Pitta',
    prakriti_kapha: 'Kapha',
    prakriti_vata_pitta: 'Vata-Pitta',
    prakriti_pitta_kapha: 'Pitta-Kapha',
    prakriti_vata_kapha: 'Vata-Kapha',
    prakriti_tridosha: 'Tridosha',
    agni_sama: 'Sama (Normal)',
    agni_vishama: 'Vishama (Irregular)',
    agni_tikshna: 'Tikshna (Sharp/Intense)',
    agni_manda: 'Manda (Low/Weak)',
    koshta_krura: 'Krura (Hard bowel)',
    koshta_mridu: 'Mridu (Soft bowel)',
    koshta_madhya: 'Madhya (Moderate)',
  },
};

export default en;
