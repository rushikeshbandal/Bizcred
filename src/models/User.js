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

    // wallet: {
    //   balance: {
    //     type: Number,
    //     default: 0,
    //   },
    // },

    // =========================
    // KYC
    // =========================

    kyc: {
      pan: {
        type: String,
      },

      aadhaar: {
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
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);