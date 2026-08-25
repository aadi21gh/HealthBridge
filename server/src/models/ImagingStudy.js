import mongoose from 'mongoose';

const { Schema } = mongoose;

const imagingStudySchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    modality: {
      type: String,
      enum: ['CT', 'MRI', 'X-Ray', 'Ultrasound', 'PET', 'SPECT', 'Other'],
      required: true,
    },
    bodyPart: { type: String },
    studyDate: { type: Date, required: true },
    description: { type: String },
    findings: { type: String },
    impression: { type: String },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    documentReferences: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
    fhirId: { type: String },
  },
  { timestamps: true }
);

imagingStudySchema.index({ patientId: 1, studyDate: -1 });

const ImagingStudy = mongoose.model('ImagingStudy', imagingStudySchema);

export default ImagingStudy;
