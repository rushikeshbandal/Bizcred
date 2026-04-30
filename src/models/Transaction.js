import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["credit", "debit"],
  },
  amount: Number,
}, { timestamps: true });

export default mongoose.models.Transaction ||
mongoose.model("Transaction", TransactionSchema);