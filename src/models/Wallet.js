import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    default: "active"
  }
});

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);