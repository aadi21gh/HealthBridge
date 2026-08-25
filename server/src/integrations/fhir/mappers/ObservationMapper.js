/**
 * FHIR R4 Observation Resource Mapper
 */
export class ObservationMapper {
  static toFHIR(observation) {
    if (!observation) return null;

    const resource = {
      resourceType: 'Observation',
      id: observation._id?.toString() || observation.id,
      meta: {
        lastUpdated: observation.updatedAt ? new Date(observation.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'],
      },
      status: 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: observation.code || 'UNKNOWN',
            display: observation.display,
          },
        ],
        text: observation.display,
      },
      subject: {
        reference: `Patient/${observation.patientId?.toString() || observation.patientId}`,
      },
      effectiveDateTime: observation.observedAt ? new Date(observation.observedAt).toISOString() : undefined,
    };

    if (typeof observation.value === 'number') {
      resource.valueQuantity = {
        value: observation.value,
        unit: observation.unit || '',
        system: 'http://unitsofmeasure.org',
      };
    } else if (observation.value !== undefined) {
      resource.valueString = String(observation.value);
    }

    if (observation.referenceRange) {
      resource.referenceRange = [
        {
          low: observation.referenceRange.low ? { value: observation.referenceRange.low } : undefined,
          high: observation.referenceRange.high ? { value: observation.referenceRange.high } : undefined,
          text: observation.referenceRange.text,
        },
      ];
    }

    if (observation.interpretation) {
      resource.interpretation = [
        {
          text: observation.interpretation,
        },
      ];
    }

    return resource;
  }
}

export default ObservationMapper;
