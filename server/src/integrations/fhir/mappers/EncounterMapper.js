/**
 * FHIR R4 Encounter Resource Mapper
 */
export class EncounterMapper {
  static toFHIR(encounter) {
    if (!encounter) return null;

    return {
      resourceType: 'Encounter',
      id: encounter._id?.toString() || encounter.id,
      meta: {
        lastUpdated: encounter.updatedAt ? new Date(encounter.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Encounter'],
      },
      status: encounter.status || 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: encounter.type === 'INPATIENT' ? 'IMP' : encounter.type === 'EMERGENCY' ? 'EMER' : 'AMB',
        display: encounter.type,
      },
      subject: {
        reference: `Patient/${encounter.patientId?.toString() || encounter.patientId}`,
      },
      period: {
        start: encounter.startDate ? new Date(encounter.startDate).toISOString() : undefined,
        end: encounter.endDate ? new Date(encounter.endDate).toISOString() : undefined,
      },
      reasonCode: encounter.chiefComplaint
        ? [
            {
              text: encounter.chiefComplaint,
            },
          ]
        : undefined,
    };
  }
}

export default EncounterMapper;
