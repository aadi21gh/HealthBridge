import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'SYSTEM_ADMIN'],
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // Stored as array of hashed tokens for multi-device support
    refreshTokens: [
      {
        tokenHash: { type: String, select: false },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        userAgent: { type: String },
        ipAddress: { type: String },
      },
    ],

    // Security
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for refresh token lookup performance
userSchema.index({ email: 1, isActive: 1 });

const User = mongoose.model('User', userSchema);

export default User;
