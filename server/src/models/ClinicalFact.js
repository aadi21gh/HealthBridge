import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * ClinicalFact — provenance-tracked clinical information extracted
 * from kiosk intake sessions. Every fact knows its source and verification status.
 *
 * After doctor verification, facts are promoted to the existing
 * medical record models (Condition, Allergy, Medication, Procedure, etc.)
 */
const clinicalFactSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    intakeSessionId: { type: Schema.Types.ObjectId, ref: 'IntakeSession', required: true, index: true },

    category: {
      type: String,
      enum: [
        'chief_complaint',
        'hpi',
        'symptom',
        'condition',
        'allergy',
        'medication',
        'procedure',
        'surgery',
        'family_history',
        'personal_history',
        'lifestyle',
        'diet',
        'sleep',
        'substance_use',
        'obstetric_history',
        'gynecological_history',
        'immunization',
        'observation',
        'review_of_systems',
        'other',
      ],
      required: true,
    },

    // The clinical concept (e.g. "Hypertension", "Cholecystectomy")
    concept: { type: String, required: true },

    // Structured value (dosage, date, severity, etc.)
    value: { type: Schema.Types.Mixed },

    // When this fact applies to (onset date, procedure date, etc.)
    effectiveDate: { type: Date },
    approximateDate: { type: String }, // e.g. "around 2021"

    // Source provenance
    source: {
      type: String,
      enum: ['PATIENT_REPORTED', 'DOCUMENT_EXTRACTED', 'AI_EXTRACTED', 'FHIR_IMPORTED', 'DOCTOR_ENTERED', 'DOCTOR_VERIFIED'],
      required: true,
    },
    sourceDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
    originalText: { type: String }, // raw text that produced this fact

    // Verification
    verified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'Practitioner' },
    verifiedAt: { type: Date },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EDITED', 'REJECTED'],
      default: 'PENDING',
    },
    doctorNotes: { type: String },

    // After verification, link to the promoted medical record
    promotedResourceType: { type: String, enum: ['Condition', 'Allergy', 'Medication', 'Procedure', 'Observation', 'Immunization', null] },
    promotedResourceId: { type: Schema.Types.ObjectId },

    // AYUSH discipline (null for modern medicine)
    discipline: {
      type: String,
      enum: ['MODERN_MEDICINE', 'AYURVEDA', 'YOGA_NATUROPATHY', 'UNANI', 'SIDDHA', 'HOMEOPATHY', null],
      default: null,
    },

    // Confidence score from AI extraction (0-1)
    confidence: { type: Number, min: 0, max: 1 },
  },
  { timestamps: true }
);

clinicalFactSchema.index({ patientId: 1, category: 1 });
clinicalFactSchema.index({ intakeSessionId: 1, category: 1 });
clinicalFactSchema.index({ patientId: 1, verificationStatus: 1 });

const ClinicalFact = mongoose.model('ClinicalFact', clinicalFactSchema);

export default ClinicalFact;
