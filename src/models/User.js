import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // NEW: profile picture — stores a relative public path, e.g. /uploads/avatars/xyz.jpg
    profileImage: {
      type: String,
      default: null,
    },

    // =========================
    // ROLE
    // =========================

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // =========================
    // ACCOUNT STATUS
    // =========================

    status: {
      type: String,
      enum: ["active", "blocked", "suspended"],
      default: "active",
    },

    // =========================
    // PERSONAL DETAILS
    // =========================

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    // =========================
    // ADDRESS
    // =========================

    address: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    pincode: {
      type: String,
    },

    // =========================
    // WALLET
    // =========================
    // Wallet is now its own collection (models/Wallet.js), created
    // automatically at registration and linked via userId.
    // Removed the embedded wallet field to avoid two sources of truth.

    // =========================
    // EMAIL VERIFICATION
    // =========================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
    },

    emailOtpExpiry: {
      type: Date,
    },

    otpAttempts: {
      type: Number,
      default: 0,
    },

    // =========================
    // KYC
    // =========================

    kyc: {
      pan: {
        type: String,
      },

      // Stores only the last 4 digits of Aadhaar — never the full number,
      // per UIDAI's zero-storage guideline.
      aadhaar: {
        type: String,
      },

      // Full Aadhaar number, encrypted at rest (AES-256-GCM).
      // Never sent to the frontend — see /api/customer/me.
      aadhaarEncrypted: {
        type: String,
      },

      panName: {
        type: String,
      },

      panCategory: {
        type: String,
      },

      panStatus: {
        type: String,
      },

      status: {
        type: String,
        enum: [
          "not_submitted",
          "pending",
          "approved",
          "rejected",
        ],
        default: "not_submitted",
      },

      // ---- Aadhaar OTP verification (Sandbox.co.in) ----
      aadhaarName: {
        type: String,
      },

      aadhaarDob: {
        type: String,
      },

      aadhaarGender: {
        type: String,
      },

      aadhaarAddress: {
        type: String,
      },

      aadhaarVerified: {
        type: Boolean,
        default: false,
      },

      // Temporary — cleared once OTP is verified
      aadhaarRefId: {
        type: String,
      },

      // Temporary — cleared once OTP is verified
      aadhaarOtpExpiry: {
        type: Date,
      },

      // ---- PAN verification (Sandbox.co.in) ----

      // Editable "name as per PAN card" — defaults to user's registered
      // name, but can be corrected here without touching the account name.
      panNameAsPerPan: {
        type: String,
      },

      // Editable DOB override for PAN verification, in DD/MM/YYYY format
      // (Sandbox's required format) — defaults to user's registered dob.
      panDobOverride: {
        type: String,
      },

      panVerified: {
        type: Boolean,
        default: false,
      },

      // e.g. "individual"
      panVerifiedCategory: {
        type: String,
      },

      // e.g. "valid" / "invalid"
      panVerifiedStatus: {
        type: String,
      },

      panNameMatch: {
        type: Boolean,
      },

      panDobMatch: {
        type: Boolean,
      },

      // Aadhaar-PAN seeding/linking status, e.g. "y" / "n"
      panAadhaarSeedingStatus: {
        type: String,
      },

      panVerifiedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);