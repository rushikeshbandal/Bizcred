import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
<<<<<<< HEAD
creditScore: {type: Number,default: 0},
=======

>>>>>>> origin/main
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
<<<<<<< HEAD
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
=======
kyc: {
  pan: String,
  aadhaar: String,

  panName: String,
  panCategory: String,
  panStatus: String,

  status: {
    type: String,
    enum: ["not_submitted", "pending", "approved", "rejected"],
    default: "not_submitted"
  }
>>>>>>> origin/main
}

}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);