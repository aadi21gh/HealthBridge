/**
 * FHIR R4 Patient Resource Mapper
 */
export class PatientMapper {
  static toFHIR(patient, user = {}) {
    if (!patient) return null;

    const resource = {
      resourceType: 'Patient',
      id: patient._id?.toString() || patient.id,
      meta: {
        lastUpdated: patient.updatedAt ? new Date(patient.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
      },
      identifier: [],
      name: [
        {
          use: 'official',
          family: user.lastName || '',
          given: user.firstName ? [user.firstName] : [],
        },
      ],
      gender: patient.gender || 'unknown',
      birthDate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : undefined,
    };

    if (patient.abhaId) {
      resource.identifier.push({
        type: {
          coding: [
            {
              system: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/IdentifierType',
              code: 'ABHA',
              display: 'Ayushman Bharat Health Account',
            },
          ],
        },
        system: 'https://healthid.ndhm.gov.in',
        value: patient.abhaId,
      });
    }

    if (user.phone) {
      resource.telecom = [
        {
          system: 'phone',
          value: user.phone,
          use: 'mobile',
        },
      ];
    }

    if (patient.address) {
      resource.address = [
        {
          line: [patient.address.line1, patient.address.line2].filter(Boolean),
          city: patient.address.city,
          state: patient.address.state,
          postalCode: patient.address.pincode,
          country: patient.address.country || 'IND',
        },
      ];
    }

    return resource;
  }
}

export default PatientMapper;
