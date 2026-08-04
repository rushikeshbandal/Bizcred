let cachedToken = null;
let tokenExpiry = 0;

async function getSandboxToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const res = await fetch(`${process.env.SANDBOX_BASE_URL}/authenticate`, {
    method: "POST",
    headers: {
      "x-api-key": process.env.SANDBOX_API_KEY,
      "x-api-secret": process.env.SANDBOX_API_SECRET,
      "x-api-version": "1.0.0",
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    console.error("Sandbox auth failed:", data);
    throw new Error("Failed to authenticate with Sandbox API");
  }

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;

  return cachedToken;
}

export async function generateAadhaarOtp(aadhaarNumber) {
  const token = await getSandboxToken();

  const res = await fetch(`${process.env.SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp`, {
    method: "POST",
    headers: {
      Authorization: token,
      "x-api-key": process.env.SANDBOX_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: aadhaarNumber,
      // consent: "y",           // FIX: must be lowercase "y" to match saved example
      // reason: "For KYC",      // FIX: must be exactly "For KYC", nothing appended
      consent: "Y",
      reason: "For KYC of the Individual",
    }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}

export async function verifyAadhaarOtp(referenceId, otp) {
  const token = await getSandboxToken();

  const res = await fetch(`${process.env.SANDBOX_BASE_URL}/kyc/aadhaar/okyc/otp/verify`, {
    method: "POST",
    headers: {
      Authorization: token,
      "x-api-key": process.env.SANDBOX_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
      reference_id: String(referenceId),
      otp: String(otp),
    }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}

export async function verifyPan(pan, nameAsPerPan, dateOfBirth) {
  const token = await getSandboxToken();

  const res = await fetch(`${process.env.SANDBOX_BASE_URL}/kyc/pan/verify`, {
    method: "POST",
    headers: {
      Authorization: token,
      "x-api-key": process.env.SANDBOX_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "@entity": "in.co.sandbox.kyc.pan_verification.request",
      pan: pan,
      name_as_per_pan: nameAsPerPan,
      date_of_birth: dateOfBirth, // must be DD/MM/YYYY
      consent: "Y",
      reason: "For onboarding customers",
    }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}