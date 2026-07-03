import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

  panName: String,
  panCategory: String,
  panStatus: String,

  status: {
    type: String,
    enum: ["not_submitted", "pending", "approved", "rejected"],
    default: "not_submitted"
  }
}

}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);