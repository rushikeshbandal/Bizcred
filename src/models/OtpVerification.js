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

    // NEW: distinguishes login OTPs from email-change OTPs sharing this collection
    purpose: {
      type: String,
      enum: ["login", "email_change"],
      default: "login",
    },

    // NEW: only used when purpose === "email_change" — the email being verified
    newEmail: {
      type: String,
    },

    // Carried over from step 1 so we can save LoginHistory after OTP succeeds (login only)
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

OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OtpVerification ||
  mongoose.model("OtpVerification", OtpVerificationSchema);