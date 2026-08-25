import mongoose from 'mongoose';

const { Schema } = mongoose;

const conditionSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    code: { type: String }, // ICD-10 or SNOMED code
    display: { type: String, required: true },
    system: { type: String, enum: ['ICD-10', 'SNOMED-CT', 'other'], default: 'ICD-10' },
    clinicalStatus: {
      type: String,
      enum: ['active', 'resolved', 'inactive', 'recurrence', 'unknown'],
      default: 'active',
    },
    verificationStatus: {
      type: String,
      enum: ['unconfirmed', 'provisional', 'confirmed', 'refuted'],
      default: 'confirmed',
    },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
    onsetDate: { type: Date },
    abatementDate: { type: Date },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    notes: { type: String },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

conditionSchema.index({ patientId: 1, clinicalStatus: 1 });

const Condition = mongoose.model('Condition', conditionSchema);

export default Condition;
