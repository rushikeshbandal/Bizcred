import jwt from "jsonwebtoken";

export function verifyAdmin(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    throw new Error("No token");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return decoded;
}