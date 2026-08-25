/**
 * FHIR R4 ImagingStudy Resource Mapper
 */
export class ImagingStudyMapper {
  static toFHIR(study) {
    if (!study) return null;

    return {
      resourceType: 'ImagingStudy',
      id: study._id?.toString() || study.id,
      meta: {
        lastUpdated: study.updatedAt ? new Date(study.updatedAt).toISOString() : new Date().toISOString(),
      },
      status: 'available',
      subject: {
        reference: `Patient/${study.patientId?.toString() || study.patientId}`,
      },
      started: study.studyDate ? new Date(study.studyDate).toISOString() : undefined,
      description: study.description,
      series: [
        {
          modality: {
            code: study.modality || 'OTHER',
            system: 'http://dicom.nema.org/resources/ontology/DCM',
          },
          bodySite: study.bodyPart ? { display: study.bodyPart } : undefined,
        },
      ],
      note: study.impression ? [{ text: study.impression }] : undefined,
    };
  }
}

export default ImagingStudyMapper;
