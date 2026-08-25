import mongoose from 'mongoose';

const { Schema } = mongoose;

const allergySchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    code: { type: String },
    display: { type: String, required: true },
    criticality: {
      type: String,
      enum: ['low', 'high', 'unable-to-assess'],
      default: 'unable-to-assess',
    },
    type: { type: String, enum: ['allergy', 'intolerance'], default: 'allergy' },
    category: [
      {
        type: String,
        enum: ['food', 'medication', 'environment', 'biologic'],
      },
    ],
    reaction: [
      {
        description: { type: String },
        severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['unconfirmed', 'confirmed', 'refuted'],
      default: 'confirmed',
    },
    onsetDate: { type: Date },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    notes: { type: String },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

const Allergy = mongoose.model('Allergy', allergySchema);

export default Allergy;
