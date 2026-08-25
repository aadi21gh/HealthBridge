/**
 * FHIR R4 AllergyIntolerance Resource Mapper
 */
export class AllergyMapper {
  static toFHIR(allergy) {
    if (!allergy) return null;

    return {
      resourceType: 'AllergyIntolerance',
      id: allergy._id?.toString() || allergy.id,
      meta: {
        lastUpdated: allergy.updatedAt ? new Date(allergy.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/AllergyIntolerance'],
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active',
            display: 'Active',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
            code: allergy.verificationStatus || 'confirmed',
            display: allergy.verificationStatus || 'Confirmed',
          },
        ],
      },
      type: allergy.type || 'allergy',
      category: allergy.category || ['medication'],
      criticality: allergy.criticality || 'unable-to-assess',
      code: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: allergy.code || 'UNKNOWN',
            display: allergy.display,
          },
        ],
        text: allergy.display,
      },
      patient: {
        reference: `Patient/${allergy.patientId?.toString() || allergy.patientId}`,
      },
      reaction: (allergy.reaction || []).map((r) => ({
        manifestation: [
          {
            text: r.description,
          },
        ],
        severity: r.severity || 'mild',
      })),
    };
  }
}

export default AllergyMapper;
