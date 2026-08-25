import mongoose from 'mongoose';

const { Schema } = mongoose;

const observationSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    diagnosticReportId: { type: Schema.Types.ObjectId, ref: 'DiagnosticReport' },
    code: { type: String },
    display: { type: String, required: true },
    system: { type: String, enum: ['LOINC', 'SNOMED-CT', 'other'] },
    value: { type: Schema.Types.Mixed }, // numeric or string
    unit: { type: String },
    referenceRange: {
      low: { type: Number },
      high: { type: Number },
      text: { type: String },
    },
    interpretation: {
      type: String,
      enum: ['normal', 'high', 'low', 'critical-high', 'critical-low', 'abnormal', 'unknown'],
    },
    observedAt: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

observationSchema.index({ patientId: 1, observedAt: -1 });
observationSchema.index({ patientId: 1, code: 1, observedAt: -1 }); // trend queries

const Observation = mongoose.model('Observation', observationSchema);

export default Observation;
