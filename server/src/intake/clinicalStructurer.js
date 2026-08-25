/**
 * Clinical Structurer
 *
 * Converts raw patient answers and document extractions into structured
 * clinical facts with provenance tracking.
 *
 * IMPORTANT: Never presents AI-extracted information as doctor-verified.
 * All facts default to PATIENT_REPORTED or AI_EXTRACTED source.
 */
import { CATEGORIES } from './questionBank.js';

export class ClinicalStructurer {
  /**
   * Convert intake session answers into structured clinical facts.
   * Returns an array of ClinicalFact-compatible objects.
   */
  structureFromAnswers(answers = [], intakeSessionId, patientId) {
    const facts = [];

    for (const answer of answers) {
      if (answer.skipped) continue;

      const baseFact = {
        patientId,
        intakeSessionId,
        source: 'PATIENT_REPORTED',
        originalText: answer.rawText,
        verified: false,
        verificationStatus: 'PENDING',
      };

      switch (answer.clinicalConcept) {
        case 'chief_complaint':
          facts.push({
            ...baseFact,
            category: 'chief_complaint',
            concept: answer.rawText,
            value: { severity: this._findSeverity(answers) },
          });
          break;

        case 'past_medical_history':
          if (Array.isArray(answer.structuredValue)) {
            for (const condKey of answer.structuredValue) {
              if (condKey === 'condition_none') continue;
              facts.push({
                ...baseFact,
                category: 'condition',
                concept: this._conditionKeyToLabel(condKey),
                value: { status: 'reported' },
              });
            }
          }
          break;

        case 'past_surgical_history':
          if (answer.structuredValue === true) {
            const details = answers.find((a) => a.clinicalConcept === 'past_surgical_details');
            if (details?.rawText) {
              facts.push({
                ...baseFact,
                category: 'surgery',
                concept: details.rawText,
                originalText: details.rawText,
              });
            }
          }
          break;

        case 'medication_history':
          if (answer.structuredValue === true) {
            const details = answers.find((a) => a.clinicalConcept === 'medication_details');
            if (details?.rawText) {
              facts.push({
                ...baseFact,
                category: 'medication',
                concept: details.rawText,
                originalText: details.rawText,
              });
            }
          }
          break;

        case 'allergy_history':
          if (answer.structuredValue === true) {
            const details = answers.find((a) => a.clinicalConcept === 'allergy_details');
            if (details?.rawText) {
              facts.push({
                ...baseFact,
                category: 'allergy',
                concept: details.rawText,
                originalText: details.rawText,
              });
            }
          }
          break;

        case 'family_history':
          if (Array.isArray(answer.structuredValue)) {
            for (const key of answer.structuredValue) {
              if (key === 'family_none' || key === 'family_unknown') continue;
              facts.push({
                ...baseFact,
                category: 'family_history',
                concept: this._familyKeyToLabel(key),
              });
            }
          }
          break;

        case 'smoking_status':
          if (answer.structuredValue && answer.structuredValue !== 'smoking_prefer_not') {
            facts.push({
              ...baseFact,
              category: 'lifestyle',
              concept: 'Smoking status',
              value: { status: answer.structuredValue },
            });
          }
          break;

        case 'alcohol_use':
          if (answer.structuredValue && answer.structuredValue !== 'alcohol_prefer_not') {
            facts.push({
              ...baseFact,
              category: 'lifestyle',
              concept: 'Alcohol use',
              value: { status: answer.structuredValue },
            });
          }
          break;

        case 'diet':
          if (answer.structuredValue) {
            facts.push({
              ...baseFact,
              category: 'diet',
              concept: 'Diet preference',
              value: { type: answer.structuredValue },
            });
          }
          break;

        case 'sleep':
          if (answer.structuredValue) {
            facts.push({
              ...baseFact,
              category: 'sleep',
              concept: 'Sleep quality',
              value: { quality: answer.structuredValue },
            });
          }
          break;

        case 'menstrual_history':
          if (answer.structuredValue && answer.structuredValue !== 'menstrual_na') {
            facts.push({
              ...baseFact,
              category: 'gynecological_history',
              concept: 'Menstrual history',
              value: { pattern: answer.structuredValue },
            });
          }
          break;

        case 'pregnancy_status':
          if (answer.structuredValue && answer.structuredValue !== 'pregnancy_na') {
            facts.push({
              ...baseFact,
              category: 'obstetric_history',
              concept: 'Pregnancy status',
              value: { status: answer.structuredValue },
            });
          }
          break;

        default:
          // Generic fact for any remaining concepts
          if (answer.rawText || answer.structuredValue) {
            facts.push({
              ...baseFact,
              category: answer.category || 'other',
              concept: answer.clinicalConcept,
              value: answer.structuredValue,
            });
          }
      }
    }

    return facts;
  }

  /**
   * Build a structured HPI summary from answers.
   */
  buildHPISummary(answers = []) {
    const hpiFields = {};
    for (const ans of answers) {
      if (ans.category === CATEGORIES.HPI && !ans.skipped && ans.rawText) {
        hpiFields[ans.clinicalConcept] = ans.rawText;
      }
    }

    const parts = [];
    if (hpiFields.chief_complaint) parts.push(`Chief complaint: ${hpiFields.chief_complaint}`);
    if (hpiFields.onset) parts.push(`Onset: ${hpiFields.onset}`);
    if (hpiFields.duration) parts.push(`Duration: ${hpiFields.duration}`);
    if (hpiFields.location) parts.push(`Location: ${hpiFields.location}`);
    if (hpiFields.character) parts.push(`Character: ${hpiFields.character}`);
    if (hpiFields.severity) parts.push(`Severity: ${hpiFields.severity}/10`);
    if (hpiFields.timing) parts.push(`Timing: ${hpiFields.timing}`);
    if (hpiFields.progression) parts.push(`Progression: ${hpiFields.progression}`);
    if (hpiFields.aggravating_factors) parts.push(`Aggravating: ${hpiFields.aggravating_factors}`);
    if (hpiFields.relieving_factors) parts.push(`Relieving: ${hpiFields.relieving_factors}`);
    if (hpiFields.associated_symptoms) parts.push(`Associated: ${hpiFields.associated_symptoms}`);

    return parts.join('. ');
  }

  /**
   * Build structured session data from answers.
   */
  buildStructuredData(answers = []) {
    const ansMap = {};
    for (const a of answers) {
      ansMap[a.clinicalConcept] = a;
    }

    return {
      chiefComplaint: ansMap.chief_complaint?.rawText || null,
      hpiSummary: this.buildHPISummary(answers),
      pastMedicalHistory: this._extractList(ansMap.past_medical_history, ansMap.past_medical_details),
      pastSurgicalHistory: ansMap.past_surgical_details?.rawText
        ? [{ description: ansMap.past_surgical_details.rawText, source: 'PATIENT_REPORTED' }]
        : [],
      medicationHistory: ansMap.medication_details?.rawText
        ? [{ description: ansMap.medication_details.rawText, source: 'PATIENT_REPORTED' }]
        : [],
      allergyHistory: ansMap.allergy_details?.rawText
        ? [{ description: ansMap.allergy_details.rawText, source: 'PATIENT_REPORTED' }]
        : [],
      familyHistory: this._extractFamilyHistory(ansMap.family_history),
      personalHistory: {
        smoking: ansMap.smoking_status?.structuredValue || null,
        alcohol: ansMap.alcohol_use?.structuredValue || null,
        diet: ansMap.diet?.structuredValue || null,
        sleep: ansMap.sleep?.structuredValue || null,
      },
      reviewOfSystems: ansMap.review_of_systems?.rawText || null,
    };
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  _findSeverity(answers) {
    const sev = answers.find((a) => a.clinicalConcept === 'severity');
    return sev?.structuredValue || null;
  }

  _conditionKeyToLabel(key) {
    const map = {
      condition_diabetes: 'Diabetes',
      condition_hypertension: 'Hypertension',
      condition_heart_disease: 'Heart disease',
      condition_asthma: 'Asthma',
      condition_thyroid: 'Thyroid disorder',
      condition_kidney_disease: 'Kidney disease',
      condition_liver_disease: 'Liver disease',
      condition_tuberculosis: 'Tuberculosis',
      condition_cancer: 'Cancer',
      condition_epilepsy: 'Epilepsy',
      condition_arthritis: 'Arthritis',
      condition_other: 'Other condition',
    };
    return map[key] || key;
  }

  _familyKeyToLabel(key) {
    const map = {
      family_diabetes: 'Diabetes (family)',
      family_hypertension: 'Hypertension (family)',
      family_heart_disease: 'Heart disease (family)',
      family_cancer: 'Cancer (family)',
      family_stroke: 'Stroke (family)',
      family_asthma: 'Asthma (family)',
      family_thyroid: 'Thyroid disorder (family)',
      family_mental_health: 'Mental health conditions (family)',
    };
    return map[key] || key;
  }

  _extractList(multiAnswer, detailAnswer) {
    const items = [];
    if (multiAnswer?.structuredValue && Array.isArray(multiAnswer.structuredValue)) {
      for (const key of multiAnswer.structuredValue) {
        if (key === 'condition_none') continue;
        items.push({ condition: this._conditionKeyToLabel(key), source: 'PATIENT_REPORTED' });
      }
    }
    if (detailAnswer?.rawText) {
      items.push({ details: detailAnswer.rawText, source: 'PATIENT_REPORTED' });
    }
    return items;
  }

  _extractFamilyHistory(answer) {
    if (!answer?.structuredValue || !Array.isArray(answer.structuredValue)) return [];
    return answer.structuredValue
      .filter((k) => k !== 'family_none' && k !== 'family_unknown')
      .map((k) => ({ condition: this._familyKeyToLabel(k), source: 'PATIENT_REPORTED' }));
  }
}

export default ClinicalStructurer;
