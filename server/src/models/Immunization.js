import mongoose from 'mongoose';

const { Schema } = mongoose;

const immunizationSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    vaccineCode: { type: String },
    vaccineDisplay: { type: String, required: true },
    status: { type: String, enum: ['completed', 'entered-in-error', 'not-done'], default: 'completed' },
    occurrenceDate: { type: Date },
    lotNumber: { type: String },
    manufacturer: { type: String },
    doseNumber: { type: Number },
    seriesDoses: { type: Number },
    site: { type: String },
    route: { type: String },
    administeredBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    notes: { type: String },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

const Immunization = mongoose.model('Immunization', immunizationSchema);

export default Immunization;
