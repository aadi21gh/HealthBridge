/**
 * FHIR R4 Condition Resource Mapper
 */
export class ConditionMapper {
  static toFHIR(condition) {
    if (!condition) return null;

    return {
      resourceType: 'Condition',
      id: condition._id?.toString() || condition.id,
      meta: {
        lastUpdated: condition.updatedAt ? new Date(condition.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition'],
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: condition.clinicalStatus || 'active',
            display: condition.clinicalStatus || 'Active',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: condition.verificationStatus || 'confirmed',
            display: condition.verificationStatus || 'Confirmed',
          },
        ],
      },
      code: {
        coding: [
          {
            system: condition.system === 'SNOMED-CT' ? 'http://snomed.info/sct' : 'http://hl7.org/fhir/sid/icd-10',
            code: condition.code || 'UNKNOWN',
            display: condition.display,
          },
        ],
        text: condition.display,
      },
      subject: {
        reference: `Patient/${condition.patientId?.toString() || condition.patientId}`,
      },
      onsetDateTime: condition.onsetDate ? new Date(condition.onsetDate).toISOString() : undefined,
      abatementDateTime: condition.abatementDate ? new Date(condition.abatementDate).toISOString() : undefined,
    };
  }
}

export default ConditionMapper;
