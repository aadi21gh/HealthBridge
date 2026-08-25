import mongoose from 'mongoose';

const { Schema } = mongoose;

const procedureSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    code: { type: String },
    display: { type: String, required: true },
    system: { type: String, enum: ['ICD-10-PCS', 'SNOMED-CT', 'CPT', 'other'] },
    status: {
      type: String,
      enum: ['preparation', 'in-progress', 'completed', 'stopped'],
      default: 'completed',
    },
    performedDate: { type: Date },
    performedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    bodySite: { type: String },
    outcome: { type: String },
    notes: { type: String },
    isSurgery: { type: Boolean, default: false },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

procedureSchema.index({ patientId: 1, performedDate: -1 });
procedureSchema.index({ patientId: 1, isSurgery: 1 });

const Procedure = mongoose.model('Procedure', procedureSchema);

export default Procedure;
