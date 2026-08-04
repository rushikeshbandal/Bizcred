import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    mobile: { type: String, unique: true, sparse: true },
    password: String,
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const name = await ask("Admin name: ");
  const email = (await ask("Admin email: ")).toLowerCase().trim();
  const password = await ask("Admin password: ");

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("❌ A user with this email already exists.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    mobile: "0000000000", // placeholder — adjust if your schema requires a real unique mobile
    password: hashedPassword,
    role: "admin",
    status: "active",
  });

  console.log(`✅ Admin account created: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});