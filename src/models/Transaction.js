import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  amount: Number,

  type: {
    type: String,
    enum: ["credit", "debit"],
  },

}, { timestamps: true });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);