import mongoose from "mongoose";

const AdminSettingsSchema = new mongoose.Schema(
  {
    general: {
      companyName: {
        type: String,
        default: "",
      },

      supportEmail: {
        type: String,
        default: "",
      },

      contactNumber: {
        type: String,
        default: "",
      },
    },

    email: {
      smtpHost: {
        type: String,
        default: "",
      },

      smtpPort: {
        type: Number,
        default: 587,
      },

      smtpUser: {
        type: String,
        default: "",
      },

      smtpPassword: {
        type: String,
        default: "",
      },
    },

    kyc: {
      enabled: {
        type: Boolean,
        default: true,
      },

      provider: {
        type: String,
        default: "Didit",
      },

      verificationLimit: {
        type: Number,
        default: 5,
      },
    },

    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      smsNotifications: {
        type: Boolean,
        default: false,
      },

      pushNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdminSettings ||
  mongoose.model("AdminSettings", AdminSettingsSchema);