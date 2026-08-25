/**
 * FHIR R4 MedicationRequest Resource Mapper
 */
export class MedicationMapper {
  static toFHIR(medication) {
    if (!medication) return null;

    return {
      resourceType: 'MedicationRequest',
      id: medication._id?.toString() || medication.id,
      meta: {
        lastUpdated: medication.updatedAt ? new Date(medication.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationRequest'],
      },
      status: medication.status === 'active' ? 'active' : 'completed',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: medication.medicationCode || 'UNKNOWN',
            display: medication.medicationDisplay,
          },
        ],
        text: medication.medicationDisplay,
      },
      subject: {
        reference: `Patient/${medication.patientId?.toString() || medication.patientId}`,
      },
      authoredOn: medication.startDate ? new Date(medication.startDate).toISOString() : undefined,
      dosageInstruction: [
        {
          text: medication.dosage?.text || medication.frequency || 'As directed',
          route: medication.dosage?.route ? { text: medication.dosage.route } : undefined,
        },
      ],
    };
  }
}

export default MedicationMapper;
