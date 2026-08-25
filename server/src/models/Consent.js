import mongoose from 'mongoose';

const { Schema } = mongoose;

// Valid consent scope items — maps to resource types
export const CONSENT_SCOPE_ITEMS = [
  'conditions',
  'allergies',
  'medications',
  'procedures',
  'observations',
  'diagnosticReports',
  'imagingStudies',
  'documents',
  'encounters',
  'immunizations',
];

const consentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    requestingPractitionerId: {
      type: Schema.Types.ObjectId,
      ref: 'Practitioner',
      required: true,
      index: true,
    },
    requestingOrganizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },

    purpose: { type: String, required: true }, // human-readable
    purposeCode: {
      type: String,
      enum: ['TREAT', 'CAREMGT', 'ETREAT', 'PUBHLTH', 'RESEARCH', 'KIOSK_INTAKE'],
      default: 'TREAT',
    },

    scope: {
      type: [String],
      enum: CONSENT_SCOPE_ITEMS,
      required: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },

    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    expiresAt: { type: Date }, // set upon approval
    rejectedAt: { type: Date },
    revokedAt: { type: Date },

    rejectionReason: { type: String },
    revocationReason: { type: String },

    // Emergency access bypass (for break-glass)
    isEmergency: { type: Boolean, default: false },
    emergencyReason: { type: String },

    notifiedPatient: { type: Boolean, default: false },
  },
  { timestamps: true }
);

consentSchema.index({ patientId: 1, status: 1 });
consentSchema.index({ requestingPractitionerId: 1, status: 1 });
consentSchema.index({ patientId: 1, requestingPractitionerId: 1, status: 1 });

const Consent = mongoose.model('Consent', consentSchema);

export default Consent;
