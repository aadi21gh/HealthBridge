import mongoose from 'mongoose';

const { Schema } = mongoose;

const medicationSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    medicationCode: { type: String },
    medicationDisplay: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'stopped', 'on-hold'],
      default: 'active',
    },
    dosage: {
      text: { type: String },
      value: { type: Number },
      unit: { type: String },
      route: { type: String },
    },
    frequency: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    prescribedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    notes: { type: String },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

medicationSchema.index({ patientId: 1, status: 1 });

const Medication = mongoose.model('Medication', medicationSchema);

export default Medication;
