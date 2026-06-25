import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    subject: String,

    message: String,

    priority: {
      type: String,
      default: "Medium",
    },

    status: {
      type: String,
      default: "Open",
    },

    assignedTo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", SupportTicketSchema);