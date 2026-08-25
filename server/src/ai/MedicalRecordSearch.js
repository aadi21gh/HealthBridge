import MockAIProvider from './providers/MockAIProvider.js';
import Condition from '../models/Condition.js';
import Allergy from '../models/Allergy.js';
import Medication from '../models/Medication.js';
import Procedure from '../models/Procedure.js';
import Observation from '../models/Observation.js';
import DiagnosticReport from '../models/DiagnosticReport.js';
import Encounter from '../models/Encounter.js';
import config from '../config/index.js';

export class MedicalRecordSearch {
  constructor() {
    // Pluggable provider selection
    this.aiProvider = new MockAIProvider();
  }

  /**
   * Searches authorized patient records with AI assistance.
   * CRITICAL SECURITY RULE:
   * Only records within the approved consent scope are retrieved and passed to AI context.
   */
  async search(patientId, query, allowedScope = []) {
    const authorizedContext = [];

    // 1. Fetch conditions if in scope
    if (allowedScope.includes('conditions')) {
      const conditions = await Condition.find({ patientId }).populate('organizationId', 'name').lean();
      conditions.forEach((c) => {
        authorizedContext.push({
          type: 'Condition',
          display: c.display,
          date: c.onsetDate,
          notes: c.notes,
          organizationName: c.organizationId?.name,
        });
      });
    }

    // 2. Fetch allergies if in scope
    if (allowedScope.includes('allergies')) {
      const allergies = await Allergy.find({ patientId }).populate('organizationId', 'name').lean();
      allergies.forEach((a) => {
        authorizedContext.push({
          type: 'Allergy',
          display: a.display,
          criticality: a.criticality,
          organizationName: a.organizationId?.name,
        });
      });
    }

    // 3. Fetch medications if in scope
    if (allowedScope.includes('medications')) {
      const meds = await Medication.find({ patientId }).populate('organizationId', 'name').lean();
      meds.forEach((m) => {
        authorizedContext.push({
          type: 'Medication',
          display: m.medicationDisplay,
          notes: m.dosage?.text,
          date: m.startDate,
          organizationName: m.organizationId?.name,
        });
      });
    }

    // 4. Fetch procedures if in scope
    if (allowedScope.includes('procedures')) {
      const procs = await Procedure.find({ patientId }).populate('organizationId', 'name').lean();
      procs.forEach((p) => {
        authorizedContext.push({
          type: 'Procedure',
          display: p.display,
          date: p.performedDate,
          notes: p.notes,
          outcome: p.outcome,
          organizationName: p.organizationId?.name,
        });
      });
    }

    // 5. Fetch diagnostic reports if in scope
    if (allowedScope.includes('diagnosticReports')) {
      const reports = await DiagnosticReport.find({ patientId }).populate('organizationId', 'name').lean();
      reports.forEach((r) => {
        authorizedContext.push({
          type: 'DiagnosticReport',
          display: r.display,
          date: r.effectiveDate,
          conclusion: r.conclusion,
          organizationName: r.organizationId?.name,
        });
      });
    }

    // Pass strictly authorized items to AI engine
    return this.aiProvider.generateResponse(query, authorizedContext);
  }

  /**
   * Generates a structured clinical summary from authorized records.
   */
  async summarize(patientId, allowedScope = []) {
    const authorizedRecords = [];

    if (allowedScope.includes('conditions')) {
      const items = await Condition.find({ patientId, clinicalStatus: 'active' }).lean();
      authorizedRecords.push(...items.map((i) => ({ ...i, resourceType: 'Condition' })));
    }
    if (allowedScope.includes('allergies')) {
      const items = await Allergy.find({ patientId }).lean();
      authorizedRecords.push(...items.map((i) => ({ ...i, resourceType: 'Allergy' })));
    }
    if (allowedScope.includes('medications')) {
      const items = await Medication.find({ patientId, status: 'active' }).lean();
      authorizedRecords.push(...items.map((i) => ({ ...i, resourceType: 'Medication' })));
    }
    if (allowedScope.includes('procedures')) {
      const items = await Procedure.find({ patientId }).lean();
      authorizedRecords.push(...items.map((i) => ({ ...i, resourceType: 'Procedure' })));
    }

    return this.aiProvider.summarizeRecords(authorizedRecords);
  }
}

export default MedicalRecordSearch;
