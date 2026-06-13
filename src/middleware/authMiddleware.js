import jwt from "jsonwebtoken";

export const verifyAdmin = (req) => {

  try {

    const authHeader =
      req.headers.get("authorization");

    if (!authHeader) {
      throw new Error("No Token");
    }

    const token =
      authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ✅ CHECK ADMIN
    if (decoded.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return decoded;

  } catch (error) {

    throw new Error("Unauthorized");

  }

};