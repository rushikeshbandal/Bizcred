import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
creditScore: {type: Number,default: 0},
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  },

  status: {
    type: String,
    enum: ["active", "blocked", "suspended"],
    default: "active",
  },

  // ✅ UPDATED KYC
 kyc: {
  pan: String,

  aadhaar: String,

  sessionId: String,

  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "in_progress",
      "in_review"
    ],
    default:  "not_submitted"
  },

  verificationData: mongoose.Schema.Types.Mixed,

  updatedAt: Date
}

}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);