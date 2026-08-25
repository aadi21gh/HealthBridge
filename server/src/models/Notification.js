import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'CONSENT_REQUEST',
        'CONSENT_APPROVED',
        'CONSENT_REJECTED',
        'CONSENT_REVOKED',
        'CONSENT_EXPIRED',
        'EMERGENCY_ACCESS',
        'RECORD_ADDED',
        'DOCUMENT_READY',
        'INTAKE_READY',
        'INTAKE_RED_FLAG',
        'SYSTEM',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedResourceType: { type: String },
    relatedResourceId: { type: Schema.Types.ObjectId },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
