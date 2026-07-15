import mongoose from "mongoose";

const OtpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    // Carried over from step 1 so we can save LoginHistory after OTP succeeds
    selfie: String,
    latitude: Number,
    longitude: Number,
    ip: String,
    browser: String,

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTP docs
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpVerification ||
  mongoose.model("OtpVerification", OtpVerificationSchema);