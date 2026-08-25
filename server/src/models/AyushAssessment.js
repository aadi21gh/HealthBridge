import mongoose from 'mongoose';

const { Schema } = mongoose;

const assessmentFieldSchema = new Schema(
  {
    fieldKey: { type: String, required: true }, // e.g. 'prakriti', 'vikriti', 'agni'
    fieldLabel: { type: String, required: true }, // human-readable label
    value: { type: Schema.Types.Mixed },
    notes: { type: String },
  },
  { _id: false }
);

const ayushAssessmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    intakeSessionId: { type: Schema.Types.ObjectId, ref: 'IntakeSession', required: true, index: true },

    discipline: {
      type: String,
      enum: ['AYURVEDA', 'YOGA_NATUROPATHY', 'UNANI', 'SIDDHA', 'HOMEOPATHY'],
      required: true,
    },

    // Extensible assessment fields — each discipline defines its own field keys
    assessments: [assessmentFieldSchema],

    // Practitioner who assessed (if applicable)
    assessedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    assessedAt: { type: Date, default: Date.now },

    // Source tracking
    source: {
      type: String,
      enum: ['PATIENT_REPORTED', 'PRACTITIONER_ASSESSED', 'AI_SUGGESTED'],
      default: 'PATIENT_REPORTED',
    },

    notes: { type: String },
  },
  { timestamps: true }
);

ayushAssessmentSchema.index({ patientId: 1, discipline: 1 });

const AyushAssessment = mongoose.model('AyushAssessment', ayushAssessmentSchema);

export default AyushAssessment;
