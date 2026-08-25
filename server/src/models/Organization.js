import mongoose from 'mongoose';

const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY', 'IMAGING_CENTER', 'OTHER'],
      required: true,
    },
    registrationNumber: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String, default: 'India' },
    },
    contactEmail: { type: String },
    contactPhone: { type: String },
    isVerified: { type: Boolean, default: false },
    adminUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    fhirId: { type: String },
  },
  { timestamps: true }
);

organizationSchema.index({ name: 'text' });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
