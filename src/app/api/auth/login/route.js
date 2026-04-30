import jwt from "jsonwebtoken";

export async function POST(req) {
  const { email, password } = await req.json();

  // 🔐 HARDCODED ADMIN
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "123456";

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return Response.json({
      success: false,
      message: "Invalid admin credentials"
    });
  }

  // ✅ generate token
  const token = jwt.sign(
    {
      userId: "admin",
      role: "admin"
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return Response.json({
    success: true,
    message: "Admin login successful",
    token
  });
}