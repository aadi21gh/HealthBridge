import mongoose from 'mongoose';

const { Schema } = mongoose;

const diagnosticReportSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    code: { type: String },
    display: { type: String, required: true },
    status: {
      type: String,
      enum: ['registered', 'partial', 'final', 'amended', 'corrected', 'cancelled'],
      default: 'final',
    },
    effectiveDate: { type: Date, required: true },
    conclusion: { type: String },
    results: [{ type: Schema.Types.ObjectId, ref: 'Observation' }],
    documentReferences: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

diagnosticReportSchema.index({ patientId: 1, effectiveDate: -1 });

const DiagnosticReport = mongoose.model('DiagnosticReport', diagnosticReportSchema);

export default DiagnosticReport;
