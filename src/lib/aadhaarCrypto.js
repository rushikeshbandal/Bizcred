import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const key = process.env.AADHAAR_ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("AADHAAR_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }
  return Buffer.from(key, "hex");
}

export function encryptAadhaar(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptAadhaar(stored) {
  const [ivHex, authTagHex, encryptedHex] = stored.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}