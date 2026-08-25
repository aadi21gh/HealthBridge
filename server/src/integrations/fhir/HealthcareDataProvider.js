/**
 * Abstract interface for healthcare data providers.
 * Allows HealthBridge to fetch clinical records from local MongoDB,
 * external FHIR servers, or future ABDM HIE networks seamlessly.
 */
export class HealthcareDataProvider {
  async getPatient(patientId) {
    throw new Error('getPatient must be implemented by provider');
  }

  async getEncounters(patientId, filter = {}) {
    throw new Error('getEncounters must be implemented by provider');
  }

  async getConditions(patientId, filter = {}) {
    throw new Error('getConditions must be implemented by provider');
  }

  async getAllergies(patientId, filter = {}) {
    throw new Error('getAllergies must be implemented by provider');
  }

  async getMedications(patientId, filter = {}) {
    throw new Error('getMedications must be implemented by provider');
  }

  async getProcedures(patientId, filter = {}) {
    throw new Error('getProcedures must be implemented by provider');
  }

  async getObservations(patientId, filter = {}) {
    throw new Error('getObservations must be implemented by provider');
  }

  async getDiagnosticReports(patientId, filter = {}) {
    throw new Error('getDiagnosticReports must be implemented by provider');
  }

  async getImagingStudies(patientId, filter = {}) {
    throw new Error('getImagingStudies must be implemented by provider');
  }

  async getImmunizations(patientId, filter = {}) {
    throw new Error('getImmunizations must be implemented by provider');
  }
}

export default HealthcareDataProvider;
