import mongoose from 'mongoose';

const { Schema } = mongoose;

const kioskSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, trim: true }, // e.g. "OPD Reception, Building A"
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },

    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'IN_USE', 'DISABLED'],
      default: 'OFFLINE',
      index: true,
    },

    // Device authentication
    deviceToken: { type: String, required: true, select: false, unique: true },

    // Metadata
    softwareVersion: { type: String, default: '1.0.0' },
    lastActiveAt: { type: Date },
    currentSessionId: { type: Schema.Types.ObjectId, ref: 'IntakeSession' },

    // Administration
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    disabledAt: { type: Date },
    disabledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disableReason: { type: String },
  },
  { timestamps: true }
);

kioskSchema.index({ organizationId: 1, status: 1 });

const Kiosk = mongoose.model('Kiosk', kioskSchema);

export default Kiosk;
