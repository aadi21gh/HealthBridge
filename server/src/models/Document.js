import mongoose from 'mongoose';

const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    documentType: {
      type: String,
      enum: [
        'LAB_REPORT',
        'IMAGING_REPORT',
        'DISCHARGE_SUMMARY',
        'PRESCRIPTION',
        'SURGICAL_REPORT',
        'CONSULTATION_NOTE',
        'VACCINATION_RECORD',
        'CONSENT_FORM',
        'INSURANCE_DOCUMENT',
        'OPD_NOTE',
        'MEDICAL_CERTIFICATE',
        'OTHER',
      ],
      required: true,
    },

    title: { type: String },
    fileName: { type: String, required: true },
    mimeType: {
      type: String,
      enum: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
      required: true,
    },
    sizeBytes: { type: Number },

    // Private storage — NEVER expose storageKey in API responses
    storageKey: { type: String, required: true, select: false },

    // OCR / extraction results
    extractedText: { type: String, select: false }, // large text, not returned by default
    extractionConfidence: { type: Number, min: 0, max: 1 },
    extractionMethod: { type: String, enum: ['ocr', 'text-layer', 'manual', 'none'] },
    extractedAt: { type: Date },

    // Linked clinical resource
    linkedResourceType: {
      type: String,
      enum: ['Encounter', 'DiagnosticReport', 'Procedure', 'ImagingStudy', 'Condition', null],
    },
    linkedResourceId: { type: Schema.Types.ObjectId },

    status: {
      type: String,
      enum: ['UPLOADING', 'PROCESSING', 'READY', 'FAILED'],
      default: 'UPLOADING',
    },

    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },
    recordDate: { type: Date, index: true },
  },
  { timestamps: true }
);

documentSchema.index({ patientId: 1, createdAt: -1 });
documentSchema.index({ patientId: 1, documentType: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
