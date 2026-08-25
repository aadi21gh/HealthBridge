import mongoose from 'mongoose';

const { Schema } = mongoose;

const encounterSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    practitionerId: { type: Schema.Types.ObjectId, ref: 'Practitioner', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    type: {
      type: String,
      enum: ['INPATIENT', 'OUTPATIENT', 'EMERGENCY', 'LAB', 'IMAGING', 'KIOSK_INTAKE'],
      required: true,
    },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'finished', 'cancelled'],
      default: 'finished',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    chiefComplaint: { type: String },
    notes: { type: String },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

encounterSchema.index({ patientId: 1, startDate: -1 });

const Encounter = mongoose.model('Encounter', encounterSchema);

export default Encounter;
