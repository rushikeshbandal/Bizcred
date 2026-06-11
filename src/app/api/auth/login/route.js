import jwt from "jsonwebtoken";

export async function POST(req) {

  try {

    const { email, password } = await req.json();

    // ✅ ADMIN LOGIN
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "123456";

    // ❌ INVALID LOGIN
    if (
      email !== ADMIN_EMAIL ||
      password !== ADMIN_PASSWORD
    ) {

      return Response.json({
        success: false,
        message: "Invalid admin credentials"
      });

    }

    // ✅ JWT TOKEN
    const token = jwt.sign(
      {
        userId: "admin_001",
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin"
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1d"
      }
    );

    // ✅ SUCCESS
    return Response.json({
      success: true,
      message: "Admin login successful",
      token,

      admin: {
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin"
      }
    });

  } catch (error) {

    console.log(error);

    return Response.json({
      success: false,
      message: error.message
    });

  }

}