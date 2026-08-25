import HealthcareDataProvider from './HealthcareDataProvider.js';
import Patient from '../../models/Patient.js';
import Encounter from '../../models/Encounter.js';
import Condition from '../../models/Condition.js';
import Allergy from '../../models/Allergy.js';
import Medication from '../../models/Medication.js';
import Procedure from '../../models/Procedure.js';
import Observation from '../../models/Observation.js';
import DiagnosticReport from '../../models/DiagnosticReport.js';
import ImagingStudy from '../../models/ImagingStudy.js';
import Immunization from '../../models/Immunization.js';

export class LocalDatabaseProvider extends HealthcareDataProvider {
  async getPatient(patientId) {
    return Patient.findById(patientId).populate('userId', 'firstName lastName email phone').lean();
  }

  async getEncounters(patientId, filter = {}) {
    return Encounter.find({ patientId, ...filter }).sort({ startDate: -1 }).lean();
  }

  async getConditions(patientId, filter = {}) {
    return Condition.find({ patientId, ...filter }).sort({ onsetDate: -1 }).lean();
  }

  async getAllergies(patientId, filter = {}) {
    return Allergy.find({ patientId, ...filter }).lean();
  }

  async getMedications(patientId, filter = {}) {
    return Medication.find({ patientId, ...filter }).sort({ startDate: -1 }).lean();
  }

  async getProcedures(patientId, filter = {}) {
    return Procedure.find({ patientId, ...filter }).sort({ performedDate: -1 }).lean();
  }

  async getObservations(patientId, filter = {}) {
    return Observation.find({ patientId, ...filter }).sort({ observedAt: -1 }).lean();
  }

  async getDiagnosticReports(patientId, filter = {}) {
    return DiagnosticReport.find({ patientId, ...filter }).sort({ effectiveDate: -1 }).lean();
  }

  async getImagingStudies(patientId, filter = {}) {
    return ImagingStudy.find({ patientId, ...filter }).sort({ studyDate: -1 }).lean();
  }

  async getImmunizations(patientId, filter = {}) {
    return Immunization.find({ patientId, ...filter }).sort({ occurrenceDate: -1 }).lean();
  }
}

export default LocalDatabaseProvider;
