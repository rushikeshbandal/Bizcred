"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KycVerification() {
  const router = useRouter();

  // ---- Aadhaar state ----
  const [aStep, setAStep] = useState("loading"); // loading | has_stored | aadhaar | otp | done | already_verified
  const [maskedAadhaar, setMaskedAadhaar] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [aLoading, setALoading] = useState(false);
  const [aError, setAError] = useState("");
  const [aMessage, setAMessage] = useState("");
  const [aDetails, setADetails] = useState(null);
  const [isEditingAadhaar, setIsEditingAadhaar] = useState(false);
  const [editedAadhaar, setEditedAadhaar] = useState("");

  // ---- PAN state ----
  const [pStep, setPStep] = useState("loading"); // loading | has_stored | not_entered | verified
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");
  const [panDob, setPanDob] = useState(""); // DD/MM/YYYY
  const [pLoading, setPLoading] = useState(false);
  const [pError, setPError] = useState("");
  const [pDetails, setPDetails] = useState(null);
  const [isEditingPan, setIsEditingPan] = useState(false);

  function getToken() {
    return localStorage.getItem("customerToken");
  }

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const token = getToken();
    if (!token) {
      router.push("/customer/login");
      return;
    }

    try {
      const res = await fetch("/api/customer/me", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();

      if (!data.success) {
        router.push("/customer/login");
        return;
      }

      const kyc = data.user.kyc;

      // Aadhaar
      if (kyc?.aadhaarVerified) {
        setADetails({
          name: kyc.aadhaarName,
          dob: kyc.aadhaarDob,
          gender: kyc.aadhaarGender,
          address: kyc.aadhaarAddress,
        });
        setAStep("already_verified");
      } else if (kyc?.hasAadhaarOnFile) {
        setMaskedAadhaar(kyc.aadhaar ? `XXXX XXXX ${kyc.aadhaar}` : "your registered Aadhaar");
        setAStep("has_stored");
      } else {
        setAStep("aadhaar");
      }

      // PAN
      if (kyc?.panVerified) {
        setPDetails({
          pan: kyc.pan,
          category: kyc.panVerifiedCategory,
          status: kyc.panVerifiedStatus,
          nameMatch: kyc.panNameMatch,
          dobMatch: kyc.panDobMatch,
          aadhaarSeeding: kyc.panAadhaarSeedingStatus,
        });
        setPStep("verified");
      } else if (kyc?.hasPanOnFile) {
        setPanNumber(kyc.pan || "");
        setPanName(kyc.panNameAsPerPan || data.user.name || "");
        setPanDob(kyc.panDobOverride || "");
        setPStep("has_stored");
      } else {
        setPStep("not_entered");
      }
    } catch (err) {
      setAError("Unable to check verification status.");
      setAStep("aadhaar");
      setPStep("not_entered");
    }
  }

  // ===== Aadhaar handlers =====
  const sendOtpFromStoredOrEdited = async () => {
    setAError("");
    if (isEditingAadhaar && !/^\d{12}$/.test(editedAadhaar.trim())) {
      setAError("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    setALoading(true);
    try {
      const payload = isEditingAadhaar
        ? { aadhaarNumber: editedAadhaar.trim() }
        : { useStored: true };

      const res = await fetch("/api/customer/kyc/aadhaar/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + getToken() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setAMessage(data.message);
        setAStep("otp");
      } else {
        setAError(data.message);
      }
    } catch {
      setAError("Something went wrong. Please try again.");
    }
    setALoading(false);
  };

  const sendOtp = async () => {
    setAError("");
    if (!/^\d{12}$/.test(aadhaarNumber.trim())) {
      setAError("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    setALoading(true);
    try {
      const res = await fetch("/api/customer/kyc/aadhaar/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + getToken() },
        body: JSON.stringify({ aadhaarNumber: aadhaarNumber.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setAMessage(data.message);
        setAStep("otp");
      } else {
        setAError(data.message);
      }
    } catch {
      setAError("Something went wrong. Please try again.");
    }
    setALoading(false);
  };

  const verifyOtp = async () => {
    setAError("");
    if (!otp.trim()) {
      setAError("Enter the OTP.");
      return;
    }
    setALoading(true);
    try {
      const res = await fetch("/api/customer/kyc/aadhaar/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + getToken() },
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setADetails(data.details);
        setAStep("done");
      } else {
        setAError(data.message);
      }
    } catch {
      setAError("Something went wrong. Please try again.");
    }
    setALoading(false);
  };

  // ===== PAN handlers =====
  const verifyPanNow = async () => {
    setPError("");

    const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!PAN_REGEX.test(panNumber.trim().toUpperCase())) {
      setPError("Enter a valid PAN (e.g. ABCDE1234F).");
      return;
    }
    if (!panName.trim()) {
      setPError("Enter the name exactly as on the PAN card.");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(panDob.trim())) {
      setPError("Enter date of birth as DD/MM/YYYY.");
      return;
    }

    setPLoading(true);
    try {
      const res = await fetch("/api/customer/kyc/pan/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + getToken() },
        body: JSON.stringify({
          pan: panNumber.trim().toUpperCase(),
          name_as_per_pan: panName.trim(),
          date_of_birth: panDob.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPDetails(data.details);
        setPStep("verified");
      } else {
        setPError(data.message);
      }
    } catch {
      setPError("Something went wrong. Please try again.");
    }
    setPLoading(false);
  };

  if (aStep === "loading" || pStep === "loading") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={{ textAlign: "center", color: "#6b7280", fontSize: "13.5px" }}>
            Checking verification status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.stack}>
        {/* ===================== AADHAAR CARD ===================== */}
        <div style={styles.card}>
          <img src="/BizCred-logo.png" alt="BizCred" style={styles.logo} />
          <h2 style={styles.title}>Aadhaar Verification</h2>

          {aStep === "already_verified" && aDetails && (
            <>
              <div style={styles.iconSuccess}>✓</div>
              <h3 style={styles.doneTitle}>Aadhaar Already Verified</h3>
              <p style={styles.sub}>Your identity has already been confirmed. No action needed.</p>
              <div style={styles.detailBox}>
                <DetailRow label="Name" value={aDetails.name} />
                <DetailRow label="Date of Birth" value={aDetails.dob} />
                <DetailRow label="Gender" value={aDetails.gender} />
                <DetailRow label="Address" value={aDetails.address} />
              </div>
            </>
          )}

          {aStep === "has_stored" && (
            <>
              <p style={styles.sub}>We already have an Aadhaar number on file from your registration:</p>

              {!isEditingAadhaar && (
                <>
                  <div style={styles.storedBox}>{maskedAadhaar}</div>
                  <p style={styles.resendRow}>
                    <span
                      style={styles.link}
                      onClick={() => { setIsEditingAadhaar(true); setEditedAadhaar(""); setAError(""); }}
                    >
                      Update Aadhaar number
                    </span>
                  </p>
                </>
              )}

              {isEditingAadhaar && (
                <>
                  <label style={styles.label}>New Aadhaar Number</label>
                  <input
                    style={styles.input}
                    value={editedAadhaar}
                    onChange={(e) => setEditedAadhaar(e.target.value.replace(/\D/g, ""))}
                    placeholder="12-digit Aadhaar number"
                    maxLength={12}
                    autoFocus
                  />
                  <p style={styles.resendRow}>
                    <span
                      style={styles.link}
                      onClick={() => { setIsEditingAadhaar(false); setEditedAadhaar(""); setAError(""); }}
                    >
                      Cancel, use the number on file instead
                    </span>
                  </p>
                </>
              )}

              {aError && <p style={styles.error}>{aError}</p>}

              <button
                style={{ ...styles.button, ...(aLoading ? styles.buttonDisabled : {}) }}
                onClick={sendOtpFromStoredOrEdited}
                disabled={aLoading}
              >
                {aLoading ? "Sending OTP..." : "Verify This Aadhaar"}
              </button>
            </>
          )}

          {aStep === "aadhaar" && (
            <>
              <p style={styles.sub}>Verify your identity using OTP linked to your Aadhaar</p>
              <label style={styles.label}>Aadhaar Number</label>
              <input
                style={styles.input}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="12-digit Aadhaar number"
                maxLength={12}
              />
              {aError && <p style={styles.error}>{aError}</p>}
              <button
                style={{ ...styles.button, ...(aLoading ? styles.buttonDisabled : {}) }}
                onClick={sendOtp}
                disabled={aLoading}
              >
                {aLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          )}

          {aStep === "otp" && (
            <>
              {aMessage && <p style={styles.success}>{aMessage}</p>}
              <label style={styles.label}>Enter OTP</label>
              <input
                style={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit OTP"
                maxLength={6}
              />
              {aError && <p style={styles.error}>{aError}</p>}
              <button
                style={{ ...styles.button, ...(aLoading ? styles.buttonDisabled : {}) }}
                onClick={verifyOtp}
                disabled={aLoading}
              >
                {aLoading ? "Verifying..." : "Verify Aadhaar"}
              </button>
            </>
          )}

          {aStep === "done" && aDetails && (
            <>
              <div style={styles.iconSuccess}>✓</div>
              <h3 style={styles.doneTitle}>Aadhaar Verified</h3>
              <div style={styles.detailBox}>
                <DetailRow label="Name" value={aDetails.name} />
                <DetailRow label="Date of Birth" value={aDetails.dob} />
                <DetailRow label="Gender" value={aDetails.gender} />
                <DetailRow label="Address" value={aDetails.address} />
              </div>
            </>
          )}
        </div>

        {/* ===================== PAN CARD ===================== */}
        <div style={styles.card}>
          <h2 style={styles.title}>PAN Verification</h2>

          {pStep === "verified" && pDetails && (
            <>
              <div style={styles.iconSuccess}>✓</div>
              <h3 style={styles.doneTitle}>PAN Verified</h3>
              <div style={styles.detailBox}>
                <DetailRow label="PAN" value={pDetails.pan} />
                <DetailRow label="Category" value={pDetails.category} />
                <DetailRow label="Status" value={pDetails.status} />
                <DetailRow label="Name Match" value={pDetails.nameMatch ? "Yes" : "No"} />
                <DetailRow label="DOB Match" value={pDetails.dobMatch ? "Yes" : "No"} />
                <DetailRow label="Aadhaar Seeding" value={pDetails.aadhaarSeeding} />
              </div>
            </>
          )}

          {pStep === "has_stored" && (
            <>
              <p style={styles.sub}>We have these PAN details on file from your registration:</p>

              {!isEditingPan && (
                <>
                  <div style={styles.storedBox}>{panNumber}</div>
                  <p style={styles.resendRow}>
                    <span style={styles.link} onClick={() => { setIsEditingPan(true); setPError(""); }}>
                      Update PAN details
                    </span>
                  </p>
                </>
              )}

              {isEditingPan && (
                <>
                  <label style={styles.label}>PAN Number</label>
                  <input
                    style={styles.input}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  <label style={styles.label}>Name as per PAN</label>
                  <input
                    style={styles.input}
                    value={panName}
                    onChange={(e) => setPanName(e.target.value)}
                    placeholder="Full name exactly as on PAN card"
                  />
                  <label style={styles.label}>Date of Birth (DD/MM/YYYY)</label>
                  <input
                    style={styles.input}
                    value={panDob}
                    onChange={(e) => setPanDob(e.target.value)}
                    placeholder="e.g. 21/04/1985"
                    maxLength={10}
                  />
                  <p style={styles.resendRow}>
                    <span style={styles.link} onClick={() => setIsEditingPan(false)}>
                      Done editing
                    </span>
                  </p>
                </>
              )}

              {pError && <p style={styles.error}>{pError}</p>}

              <button
                style={{ ...styles.button, ...(pLoading ? styles.buttonDisabled : {}) }}
                onClick={verifyPanNow}
                disabled={pLoading}
              >
                {pLoading ? "Verifying..." : "Verify PAN"}
              </button>
            </>
          )}

          {pStep === "not_entered" && (
            <>
              <p style={styles.sub}>No PAN number on file. Enter your details to verify.</p>
              <label style={styles.label}>PAN Number</label>
              <input
                style={styles.input}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
              />
              <label style={styles.label}>Name as per PAN</label>
              <input
                style={styles.input}
                value={panName}
                onChange={(e) => setPanName(e.target.value)}
                placeholder="Full name exactly as on PAN card"
              />
              <label style={styles.label}>Date of Birth (DD/MM/YYYY)</label>
              <input
                style={styles.input}
                value={panDob}
                onChange={(e) => setPanDob(e.target.value)}
                placeholder="e.g. 21/04/1985"
                maxLength={10}
              />
              {pError && <p style={styles.error}>{pError}</p>}
              <button
                style={{ ...styles.button, ...(pLoading ? styles.buttonDisabled : {}) }}
                onClick={verifyPanNow}
                disabled={pLoading}
              >
                {pLoading ? "Verifying..." : "Verify PAN"}
              </button>
            </>
          )}
        </div>

        <button style={styles.backButton} onClick={() => router.push("/customer/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value ?? "—"}</span>
    </div>
  );
}

const styles = {
  page: { display: "flex", justifyContent: "center", minHeight: "100vh", background: "#ffffff", padding: "30px 20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  stack: { width: "420px", display: "flex", flexDirection: "column", gap: "20px" },
  card: { background: "#ffffff", padding: "36px 32px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" },
  spinner: { width: "28px", height: "28px", border: "3px solid #e5e7eb", borderTopColor: "#1d4ed8", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" },
  logo: { display: "block", margin: "0 auto 20px", height: "44px", objectFit: "contain" },
  title: { textAlign: "center", marginBottom: "6px", color: "#111827", fontSize: "19px", fontWeight: 700 },
  sub: { textAlign: "center", color: "#6b7280", marginBottom: "18px", fontSize: "13.5px" },
  storedBox: { textAlign: "center", fontSize: "15px", fontWeight: 700, letterSpacing: "1px", color: "#111827", background: "#f5f7fa", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "13px", marginBottom: "8px" },
  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #d9dee6", fontSize: "14.5px", outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#111827" },
  button: { width: "100%", padding: "13px", background: "#1d4ed8", border: "none", borderRadius: "8px", color: "#fff", fontSize: "15px", cursor: "pointer", fontWeight: 600, marginTop: "6px" },
  buttonDisabled: { background: "#c3d0f0", cursor: "not-allowed" },
  backButton: { width: "100%", padding: "13px", background: "#ffffff", border: "1px solid #d9dee6", borderRadius: "8px", color: "#374151", fontSize: "14.5px", cursor: "pointer", fontWeight: 600 },
  error: { color: "#b3261e", background: "#fceeed", border: "1px solid #f5d0cc", padding: "10px 12px", borderRadius: "8px", marginBottom: "10px", fontSize: "13px" },
  success: { color: "#0f7a3d", background: "#e9f8ef", border: "1px solid #bdeccf", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" },
  resendRow: { textAlign: "center", marginBottom: "10px", fontSize: "13px" },
  link: { color: "#1d4ed8", fontWeight: 600, cursor: "pointer" },
  iconSuccess: { width: "52px", height: "52px", borderRadius: "50%", background: "#e9f8ef", color: "#16a34a", fontSize: "26px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" },
  doneTitle: { textAlign: "center", fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "16px" },
  detailBox: { background: "#fafbfc", border: "1px solid #edf0f4", borderRadius: "10px", padding: "14px" },
  detailRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #f0f1f3", padding: "8px 0" },
  detailLabel: { color: "#6b7280" },
  detailValue: { color: "#111827", fontWeight: 500, textAlign: "right", maxWidth: "60%" },
};