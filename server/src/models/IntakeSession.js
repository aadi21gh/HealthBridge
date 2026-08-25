import mongoose from 'mongoose';

const { Schema } = mongoose;

const answerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    clinicalConcept: { type: String, required: true },
    category: { type: String }, // e.g. 'chief_complaint', 'hpi', 'past_medical', etc.
    rawText: { type: String },
    language: { type: String },
    structuredValue: { type: Schema.Types.Mixed },
    inputMethod: {
      type: String,
      enum: ['text', 'voice', 'selection', 'select', 'multi', 'scale', 'yesno', 'skip', 'unknown', 'not_applicable'],
      default: 'text',
    },
    skipped: { type: Boolean, default: false },
    skipReason: { type: String, enum: ['dont_know', 'dont_remember', 'not_applicable', 'skip', null] },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const redFlagHitSchema = new Schema(
  {
    ruleId: { type: String, required: true },
    ruleName: { type: String, required: true },
    severity: { type: String, enum: ['INFO', 'ATTENTION', 'URGENT', 'EMERGENCY'], required: true },
    message: { type: String, required: true },
    recommendedAction: { type: String },
    triggeredAt: { type: Date, default: Date.now },
    triggeringAnswers: [{ type: String }], // questionIds that triggered this
    acknowledged: { type: Boolean, default: false },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const intakeSessionSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    kioskId: { type: Schema.Types.ObjectId, ref: 'Kiosk', index: true },
    practitionerId: { type: Schema.Types.ObjectId, ref: 'Practitioner', index: true }, // assigned doctor

    language: { type: String, default: 'en' },
    discipline: {
      type: String,
      enum: ['MODERN_MEDICINE', 'AYURVEDA', 'YOGA_NATUROPATHY', 'UNANI', 'SIDDHA', 'HOMEOPATHY'],
      default: 'MODERN_MEDICINE',
    },

    status: {
      type: String,
      enum: ['STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ABANDONED'],
      default: 'STARTED',
      index: true,
    },

    // Patient identification method used
    identificationMethod: { type: String, enum: ['phone', 'abha', 'name_dob', 'manual'] },

    // Consent
    consentGiven: { type: Boolean, default: false },
    consentTimestamp: { type: Date },
    consentLanguage: { type: String },

    // Clinical data
    answers: [answerSchema],

    // Structured clinical output
    structuredData: {
      chiefComplaint: { type: String },
      hpiSummary: { type: String },
      pastMedicalHistory: [{ type: Schema.Types.Mixed }],
      pastSurgicalHistory: [{ type: Schema.Types.Mixed }],
      medicationHistory: [{ type: Schema.Types.Mixed }],
      allergyHistory: [{ type: Schema.Types.Mixed }],
      familyHistory: [{ type: Schema.Types.Mixed }],
      personalHistory: { type: Schema.Types.Mixed },
      reviewOfSystems: { type: Schema.Types.Mixed },
    },

    // Documents uploaded during session
    documentIds: [{ type: Schema.Types.ObjectId, ref: 'Document' }],

    // Red flags
    redFlags: [redFlagHitSchema],

    // AI-generated summary for doctor
    summary: { type: String },

    // Doctor verification
    doctorVerification: {
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
      verifiedAt: { type: Date },
      status: { type: String, enum: ['PENDING', 'IN_REVIEW', 'VERIFIED', 'PARTIAL'], default: 'PENDING' },
      notes: { type: String },
    },

    // Encounter created from this intake
    encounterId: { type: Schema.Types.ObjectId, ref: 'Encounter' },

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    abandonedAt: { type: Date },

    // Session timeout tracking
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

intakeSessionSchema.index({ organizationId: 1, status: 1 });
intakeSessionSchema.index({ patientId: 1, createdAt: -1 });
intakeSessionSchema.index({ practitionerId: 1, status: 1 });
intakeSessionSchema.index({ kioskId: 1, status: 1 });

const IntakeSession = mongoose.model('IntakeSession', intakeSessionSchema);

export default IntakeSession;
