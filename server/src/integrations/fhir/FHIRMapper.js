import PatientMapper from './mappers/PatientMapper.js';
import ConditionMapper from './mappers/ConditionMapper.js';
import AllergyMapper from './mappers/AllergyMapper.js';
import MedicationMapper from './mappers/MedicationMapper.js';
import ProcedureMapper from './mappers/ProcedureMapper.js';
import ObservationMapper from './mappers/ObservationMapper.js';
import DiagnosticReportMapper from './mappers/DiagnosticReportMapper.js';
import ImagingStudyMapper from './mappers/ImagingStudyMapper.js';
import EncounterMapper from './mappers/EncounterMapper.js';

export const FHIRMapper = {
  Patient: PatientMapper,
  Condition: ConditionMapper,
  AllergyIntolerance: AllergyMapper,
  MedicationRequest: MedicationMapper,
  Procedure: ProcedureMapper,
  Observation: ObservationMapper,
  DiagnosticReport: DiagnosticReportMapper,
  ImagingStudy: ImagingStudyMapper,
  Encounter: EncounterMapper,

  /**
   * Helper to wrap resources in a FHIR Bundle
   */
  createBundle(type = 'searchset', entries = []) {
    return {
      resourceType: 'Bundle',
      type,
      total: entries.length,
      entry: entries.map((resource) => ({
        fullUrl: `urn:uuid:${resource.id}`,
        resource,
      })),
    };
  },
};

export default FHIRMapper;
