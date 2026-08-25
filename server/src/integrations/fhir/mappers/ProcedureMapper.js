/**
 * FHIR R4 Procedure Resource Mapper
 */
export class ProcedureMapper {
  static toFHIR(procedure) {
    if (!procedure) return null;

    return {
      resourceType: 'Procedure',
      id: procedure._id?.toString() || procedure.id,
      meta: {
        lastUpdated: procedure.updatedAt ? new Date(procedure.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Procedure'],
      },
      status: procedure.status || 'completed',
      code: {
        coding: [
          {
            system: procedure.system === 'SNOMED-CT' ? 'http://snomed.info/sct' : 'http://www.ama-assn.org/go/cpt',
            code: procedure.code || 'UNKNOWN',
            display: procedure.display,
          },
        ],
        text: procedure.display,
      },
      subject: {
        reference: `Patient/${procedure.patientId?.toString() || procedure.patientId}`,
      },
      performedDateTime: procedure.performedDate ? new Date(procedure.performedDate).toISOString() : undefined,
      bodySite: procedure.bodySite
        ? [
            {
              text: procedure.bodySite,
            },
          ]
        : undefined,
      outcome: procedure.outcome
        ? {
            text: procedure.outcome,
          }
        : undefined,
      note: procedure.notes ? [{ text: procedure.notes }] : undefined,
    };
  }
}

export default ProcedureMapper;
