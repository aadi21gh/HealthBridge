import mongoose from 'mongoose';

const { Schema } = mongoose;

const practitionerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    specialization: { type: String },
    licenseNumber: { type: String },
    licenseBody: { type: String }, // e.g. MCI, State Medical Council
    qualifications: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    fhirId: { type: String },
  },
  { timestamps: true }
);

const Practitioner = mongoose.model('Practitioner', practitionerSchema);

export default Practitioner;
