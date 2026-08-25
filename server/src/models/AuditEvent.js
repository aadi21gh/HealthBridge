import mongoose from 'mongoose';

const { Schema } = mongoose;

// Immutable audit log — no updates, no deletes ever
const auditEventSchema = new Schema(
  {
    action: {
      type: String,
      enum: [
        'VIEW_PATIENT',
        'VIEW_RECORD',
        'VIEW_DOCUMENT',
        'DOWNLOAD_DOCUMENT',
        'CREATE_RECORD',
        'UPDATE_RECORD',
        'DELETE_RECORD',
        'REQUEST_ACCESS',
        'APPROVE_CONSENT',
        'REJECT_CONSENT',
        'REVOKE_CONSENT',
        'EMERGENCY_ACCESS',
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'UPLOAD_DOCUMENT',
        'AI_QUERY',
        'EXPORT_RECORDS',
        // Kiosk intake actions
        'KIOSK_SESSION_START',
        'KIOSK_SESSION_COMPLETE',
        'KIOSK_SESSION_ABANDON',
        'KIOSK_CONSENT',
        'KIOSK_DOCUMENT_UPLOAD',
        'KIOSK_RED_FLAG',
        'DOCTOR_VERIFY_FACT',
        'DOCTOR_REJECT_FACT',
        'KIOSK_REGISTER',
        'KIOSK_DISABLE',
      ],
      required: true,
    },

    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
      required: true,
    },

    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },

    resourceType: { type: String }, // e.g. 'Condition', 'Document', 'Consent'
    resourceId: { type: Schema.Types.ObjectId },

    consentId: { type: Schema.Types.ObjectId, ref: 'Consent' },
    purpose: { type: String },

    ipAddress: { type: String },
    userAgent: { type: String },

    emergencyFlag: { type: Boolean, default: false },
    emergencyReason: { type: String },

    // Flexible metadata for future use
    metadata: { type: Schema.Types.Mixed },

    // Immutable timestamp — NOT using Mongoose timestamps to ensure it's set once
    timestamp: { type: Date, default: Date.now, immutable: true, index: true },
  },
  {
    // No updatedAt — audit events are WRITE ONCE
    timestamps: false,
    // Prevent modification of existing documents
  }
);

// Compound index for patient-centric audit queries
auditEventSchema.index({ patientId: 1, timestamp: -1 });
auditEventSchema.index({ actorId: 1, timestamp: -1 });
auditEventSchema.index({ organizationId: 1, timestamp: -1 });

// Make the collection append-only in application logic
// (MongoDB doesn't natively enforce this, but we enforce it via repository layer)
const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);

export default AuditEvent;
