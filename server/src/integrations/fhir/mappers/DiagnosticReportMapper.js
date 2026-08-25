/**
 * FHIR R4 DiagnosticReport Resource Mapper
 */
export class DiagnosticReportMapper {
  static toFHIR(report) {
    if (!report) return null;

    return {
      resourceType: 'DiagnosticReport',
      id: report._id?.toString() || report.id,
      meta: {
        lastUpdated: report.updatedAt ? new Date(report.updatedAt).toISOString() : new Date().toISOString(),
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DiagnosticReportLab'],
      },
      status: report.status || 'final',
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: report.code || 'UNKNOWN',
            display: report.display,
          },
        ],
        text: report.display,
      },
      subject: {
        reference: `Patient/${report.patientId?.toString() || report.patientId}`,
      },
      effectiveDateTime: report.effectiveDate ? new Date(report.effectiveDate).toISOString() : undefined,
      conclusion: report.conclusion,
      result: (report.results || []).map((resId) => ({
        reference: `Observation/${resId.toString()}`,
      })),
    };
  }
}

export default DiagnosticReportMapper;
