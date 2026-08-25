import mongoose from 'mongoose';

const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    abhaId: { type: String, unique: true, sparse: true }, // Optional ABDM ABHA number
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
    },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg

    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },

    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String, default: 'India' },
    },

    profilePhoto: { type: String }, // storage key

    // FHIR reference
    fhirId: { type: String },
  },
  { timestamps: true }
);

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;
