
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

      supportPhone: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },
    },

    email: {
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
    },

    kyc: {
      enabled: {
        type: Boolean,
        default: false,
      },

      provider: {
        type: String,
        default: "Didit",
      },

      autoApprove: {
        type: Boolean,
        default: false,
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

    security: {
      sessionTimeout: {
        type: Number,
        default: 30,
      },

      maxLoginAttempts: {
        type: Number,
        default: 5,
      },

      enable2FA: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AdminSettings ||
  mongoose.model(
    "AdminSettings",
    AdminSettingsSchema
  );