import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SupportTicket ||
  mongoose.model("SupportTicket", SupportTicketSchema);