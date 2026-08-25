import AIProvider from '../AIProvider.js';

export class MockAIProvider extends AIProvider {
  async generateResponse(query, authorizedContext = []) {
    const q = query.toLowerCase();

    // Guardrail: Detect diagnostic/prescriptive queries
    if (q.includes('diagnose') || q.includes('what disease do i have') || q.includes('prescribe') || q.includes('treatment for')) {
      return {
        answer: 'I am an AI assistant and cannot provide medical diagnoses, treatment recommendations, or prescriptions. Please consult with a qualified healthcare professional.',
        sources: [],
        guardrailTriggered: true,
      };
    }

    const matchedSources = [];

    // Search query terms in authorized records
    for (const item of authorizedContext) {
      const text = `${item.title || ''} ${item.display || ''} ${item.description || ''} ${item.notes || ''} ${item.outcome || ''} ${item.conclusion || ''}`.toLowerCase();
      
      const words = q.split(/\s+/).filter((w) => w.length > 3);
      const isMatch = words.some((word) => text.includes(word));

      if (isMatch) {
        matchedSources.push({
          title: item.display || item.title || item.type || 'Clinical Record',
          organization: item.organizationName || 'Healthcare Facility',
          date: item.date ? new Date(item.date).toISOString().split('T')[0] : 'Documented',
          snippet: item.notes || item.outcome || item.conclusion || item.display,
        });
      }
    }

    if (matchedSources.length === 0) {
      return {
        answer: 'I could not find this information in the authorized records.',
        sources: [],
        guardrailTriggered: false,
      };
    }

    // Grounded answer generator
    if (q.includes('surger') || q.includes('procedure') || q.includes('operation')) {
      const surgeries = matchedSources.filter((s) => s.title.toLowerCase().includes('appendectomy') || s.title.toLowerCase().includes('arthroplasty') || s.title.toLowerCase().includes('surgery') || s.title.toLowerCase().includes('procedure'));
      if (surgeries.length > 0) {
        const list = surgeries.map((s) => `${s.title} (${s.date} at ${s.organization})`).join(', ');
        return {
          answer: `Based on authorized clinical records, the documented procedures include: ${list}.`,
          sources: matchedSources,
          guardrailTriggered: false,
        };
      }
    }

    if (q.includes('medicat') || q.includes('drug') || q.includes('medicine')) {
      const meds = matchedSources.map((s) => `${s.title}`).join(', ');
      return {
        answer: `Documented medications in authorized records include: ${meds}.`,
        sources: matchedSources,
        guardrailTriggered: false,
      };
    }

    if (q.includes('allerg')) {
      const allergies = matchedSources.map((s) => `${s.title}`).join(', ');
      return {
        answer: `Documented allergies in authorized records include: ${allergies}.`,
        sources: matchedSources,
        guardrailTriggered: false,
      };
    }

    return {
      answer: `Found ${matchedSources.length} relevant authorized record(s) matching your query.`,
      sources: matchedSources,
      guardrailTriggered: false,
    };
  }

  async summarizeRecords(records = []) {
    const conditions = records.filter((r) => r.resourceType === 'Condition' || r.clinicalStatus);
    const medications = records.filter((r) => r.resourceType === 'Medication' || r.medicationDisplay);
    const allergies = records.filter((r) => r.resourceType === 'Allergy' || r.criticality);
    const procedures = records.filter((r) => r.resourceType === 'Procedure' || r.performedDate);

    const summaryParts = [];
    if (conditions.length > 0) {
      summaryParts.push(`Active conditions: ${conditions.map((c) => c.display).join(', ')}.`);
    }
    if (allergies.length > 0) {
      summaryParts.push(`Allergies: ${allergies.map((a) => `${a.display} (${a.criticality || 'caution'})`).join(', ')}.`);
    }
    if (medications.length > 0) {
      summaryParts.push(`Current medications: ${medications.map((m) => m.medicationDisplay || m.display).join(', ')}.`);
    }
    if (procedures.length > 0) {
      summaryParts.push(`Documented surgical/clinical procedures: ${procedures.map((p) => p.display).join(', ')}.`);
    }

    return {
      summary: summaryParts.length > 0 ? summaryParts.join(' ') : 'No clinical records available in the authorized scope to summarize.',
      recordCount: records.length,
      generatedAt: new Date().toISOString(),
    };
  }

  async extractClinicalEntities(text, language = 'en') {
    if (!text) return [];
    const t = text.toLowerCase();
    const entities = [];

    // Surgical extraction example
    if (t.includes('gallbladder') || t.includes('cholecystectomy')) {
      const yearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
      entities.push({
        category: 'surgery',
        concept: 'Cholecystectomy (Gallbladder removal)',
        approximateDate: yearMatch ? yearMatch[0] : null,
        confidence: 0.95,
        source: 'PATIENT_REPORTED',
      });
    }

    if (t.includes('appendix') || t.includes('appendectomy')) {
      const yearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
      entities.push({
        category: 'surgery',
        concept: 'Appendectomy',
        approximateDate: yearMatch ? yearMatch[0] : null,
        confidence: 0.95,
        source: 'PATIENT_REPORTED',
      });
    }

    // Condition extraction
    if (t.includes('sugar') || t.includes('diabetes') || t.includes('मधुमेह')) {
      entities.push({
        category: 'condition',
        concept: 'Diabetes Mellitus',
        confidence: 0.9,
        source: 'PATIENT_REPORTED',
      });
    }
    if (t.includes('bp') || t.includes('blood pressure') || t.includes('hypertension') || t.includes('उच्च रक्तदाब')) {
      entities.push({
        category: 'condition',
        concept: 'Essential Hypertension',
        confidence: 0.9,
        source: 'PATIENT_REPORTED',
      });
    }

    return entities;
  }

  async generateFollowUpQuestion(previousAnswers = [], language = 'en') {
    const chiefAns = previousAnswers.find((a) => a.clinicalConcept === 'chief_complaint');
    if (!chiefAns || !chiefAns.rawText) return null;

    const text = chiefAns.rawText.toLowerCase();

    if (text.includes('pain') || text.includes('दर्द') || text.includes('दुख')) {
      const questions = {
        en: 'Could you describe if the pain radiates to your back or shoulders?',
        hi: 'क्या यह दर्द आपकी पीठ या कंधों की तरफ भी फैलता है?',
        mr: 'हे दुखणे तुमच्या पाठीकडे किंवा खांद्याकडे पसरते का?',
      };
      return questions[language] || questions.en;
    }

    return null;
  }

  async classifyDocument(text = '', hint = null) {
    const t = text.toLowerCase();
    let detectedType = hint || 'OTHER';
    let detectedTitle = 'Medical Document';
    let detectedDate = new Date();

    if (t.includes('prescription') || t.includes('rx') || t.includes('tab ') || t.includes('mg')) {
      detectedType = 'PRESCRIPTION';
      detectedTitle = 'Clinical Prescription';
    } else if (t.includes('lab') || t.includes('test') || t.includes('blood') || t.includes('hba1c') || t.includes('hemoglobin')) {
      detectedType = 'LAB_REPORT';
      detectedTitle = 'Laboratory Investigation Report';
    } else if (t.includes('discharge') || t.includes('admission') || t.includes('hospital course')) {
      detectedType = 'DISCHARGE_SUMMARY';
      detectedTitle = 'Inpatient Discharge Summary';
    } else if (t.includes('x-ray') || t.includes('ct') || t.includes('mri') || t.includes('ultrasound') || t.includes('scan')) {
      detectedType = 'IMAGING_REPORT';
      detectedTitle = 'Radiology / Imaging Report';
    } else if (t.includes('opd') || t.includes('consultation')) {
      detectedType = 'OPD_NOTE';
      detectedTitle = 'Outpatient Consultation Note';
    }

    return {
      documentType: detectedType,
      detectedTitle,
      detectedDate,
      confidence: 0.92,
    };
  }

  async extractMedicalEntities(documentText = '') {
    if (!documentText) return [];
    const t = documentText.toLowerCase();
    const entities = [];

    if (t.includes('cholecystectomy') || t.includes('gallbladder')) {
      entities.push({
        category: 'surgery',
        concept: 'Cholecystectomy',
        date: '2021',
        snippet: 'Laparoscopic Cholecystectomy performed in 2021',
        confidence: 0.96,
      });
    }

    if (t.includes('hypertension') || t.includes('telmisartan')) {
      entities.push({
        category: 'condition',
        concept: 'Essential Hypertension',
        snippet: 'Essential Hypertension on Telmisartan 40mg OD',
        confidence: 0.95,
      });
      entities.push({
        category: 'medication',
        concept: 'Telmisartan 40mg',
        snippet: 'Telmisartan 40mg OD',
        confidence: 0.92,
      });
    }

    if (t.includes('penicillin') && t.includes('allerg')) {
      entities.push({
        category: 'allergy',
        concept: 'Penicillin',
        snippet: 'Penicillin allergy (urticarial rash)',
        confidence: 0.98,
      });
    }

    if (t.includes('hba1c') || t.includes('metformin')) {
      entities.push({
        category: 'condition',
        concept: 'Diabetes Mellitus / Impaired Glycemia',
        snippet: 'HbA1c: 6.8%',
        confidence: 0.9,
      });
      if (t.includes('metformin')) {
        entities.push({
          category: 'medication',
          concept: 'Metformin 500mg',
          snippet: 'Tab Metformin 500mg',
          confidence: 0.94,
        });
      }
    }

    return entities;
  }

  async generateIntakeSummary(intakeData = {}, language = 'en') {
    const parts = [];

    if (intakeData.chiefComplaint) {
      parts.push(`Chief Complaint: ${intakeData.chiefComplaint}`);
    }

    if (intakeData.hpiSummary) {
      parts.push(`HPI: ${intakeData.hpiSummary}`);
    }

    if (intakeData.pastMedicalHistory && intakeData.pastMedicalHistory.length > 0) {
      const conds = intakeData.pastMedicalHistory.map((c) => c.condition || c.details || c).join(', ');
      parts.push(`Past Medical: ${conds}`);
    } else {
      parts.push('Past Medical: No significant chronic conditions reported.');
    }

    if (intakeData.pastSurgicalHistory && intakeData.pastSurgicalHistory.length > 0) {
      const surgs = intakeData.pastSurgicalHistory.map((s) => s.description || s).join(', ');
      parts.push(`Surgical History: ${surgs}`);
    } else {
      parts.push('Surgical History: No previous surgery reported.');
    }

    if (intakeData.medicationHistory && intakeData.medicationHistory.length > 0) {
      const meds = intakeData.medicationHistory.map((m) => m.description || m).join(', ');
      parts.push(`Medications: ${meds}`);
    }

    if (intakeData.allergyHistory && intakeData.allergyHistory.length > 0) {
      const algs = intakeData.allergyHistory.map((a) => a.description || a).join(', ');
      parts.push(`Allergies: ${algs}`);
    }

    if (intakeData.redFlags && intakeData.redFlags.length > 0) {
      parts.push(`⚠️ SAFETY FLAGS: ${intakeData.redFlags.map((r) => r.ruleName || r.message).join('; ')}`);
    }

    return {
      summary: parts.join('\n\n'),
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI-compiled pre-consultation intake briefing. All facts are patient-reported or document-extracted and require clinician verification.',
    };
  }
}

export default MockAIProvider;
