"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PINCODE_REGEX = /^\d{6}$/;
const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export default function CustomerRegister() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    aadhaar: "",
    password: "",
    confirmPassword: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "pan" ? value.toUpperCase() : value,
    }));
  };

  const validate = () => {
    const cleanName = form.name.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2 || !NAME_REGEX.test(cleanName)) return "Name must contain only letters and spaces.";
    if (!EMAIL_REGEX.test(form.email)) return "Please enter a valid email address.";
    if (!MOBILE_REGEX.test(form.mobile)) return "Please enter a valid 10-digit mobile number.";
    if (!form.dob) return "Date of birth is required.";

    const age = (Date.now() - new Date(form.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) return "You must be at least 18 years old to register.";

    if (!form.gender) return "Please select a gender.";

    // Address fields are optional — only validate pincode format IF filled in
    if (form.pincode && !PINCODE_REGEX.test(form.pincode)) return "Pincode must be 6 digits.";

    if (!PAN_REGEX.test(form.pan)) return "PAN format is invalid (e.g. ABCDE1234F).";
    if (!AADHAAR_REGEX.test(form.aadhaar)) return "Aadhaar must be exactly 12 digits.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!termsAccepted) return "You must accept the Terms & Conditions.";

    return "";
  };

  const handleSubmit = async () => {
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, termsAccepted }),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push("/customer/login");
        }, 2200);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        .bc-shell { display: flex; min-height: 100vh; }
        .bc-panel { flex: 0 0 42%; }
        .bc-formside { flex: 1; }
        @media (max-width: 860px) {
          .bc-shell { flex-direction: column; }
          .bc-panel { flex: none; }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkDraw {
          0% { stroke-dashoffset: 40; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="bc-shell">
        {/* LEFT — BRAND PANEL */}
        <div className="bc-panel" style={styles.panel}>
          <div style={styles.panelTop}>
            <div style={styles.panelLogoWrap}>
              <img src="/BizCred-logo.png" alt="BizCred" style={styles.panelLogo} />
            </div>
            <span style={styles.panelTag}>Business Credit Platform</span>
          </div>

          <div style={styles.panelMid}>
            <h1 style={styles.panelHeadline}>
              One profile.
              <br />
              Fully verified, start to finish.
            </h1>
            <p style={styles.panelSub}>
              We collect your PAN and Aadhaar upfront so verification is instant
              once you're inside — no chasing paperwork later.
            </p>

            <div style={styles.reqList}>
              <ReqRow text="Government-issued PAN" />
              <ReqRow text="Aadhaar number for identity verification" />
              <ReqRow text="Valid Indian mobile number" />
            </div>
          </div>

          <p style={styles.panelFooter}>256-bit encryption · Data protected at rest</p>
        </div>

        {/* RIGHT — FORM */}
        <div className="bc-formside" style={styles.formSide}>
          <div style={styles.card}>
            <h2 style={styles.title}>Create your account</h2>
            <p style={styles.sub}>
              Fields marked <span style={styles.requiredMark}>*</span> are required
            </p>

            <label style={styles.label}>
              Full Name <span style={styles.requiredMark}>*</span>
            </label>
            <input name="name" style={styles.input} value={form.name} onChange={handleChange} placeholder="Full name" />

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>
                  Email address <span style={styles.requiredMark}>*</span>
                </label>
                <input name="email" type="email" style={styles.input} value={form.email} onChange={handleChange} placeholder="you@company.com" />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>
                  Mobile number <span style={styles.requiredMark}>*</span>
                </label>
                <input name="mobile" style={styles.input} value={form.mobile} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>
                  Date of birth <span style={styles.requiredMark}>*</span>
                </label>
                <input name="dob" type="date" style={styles.input} value={form.dob} onChange={handleChange} />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>
                  Gender <span style={styles.requiredMark}>*</span>
                </label>
                <select name="gender" style={styles.input} value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* ADDRESS SECTION — clearly marked optional */}
            <div style={styles.sectionDivider}>
              <span style={styles.sectionDividerText}>Address</span>
              <span style={styles.optionalTag}>Optional</span>
            </div>

            <label style={styles.label}>Address</label>
            <input name="address" style={styles.input} value={form.address} onChange={handleChange} placeholder="Address" />

            <div style={styles.row}>
              <div style={styles.col}>
                <label style={styles.label}>City</label>
                <input name="city" style={styles.input} value={form.city} onChange={handleChange} placeholder="City" />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>State</label>
                <input name="state" style={styles.input} value={form.state} onChange={handleChange} placeholder="State" />
              </div>
              <div style={styles.col}>
                <label style={styles.label}>Pincode</label>
                <input name="pincode" style={styles.input} value={form.pincode} onChange={handleChange} placeholder="6-digit" maxLength={6} />
              </div>
            </div>

            <div style={styles.kycBox}>
              <div style={styles.kycHeader}>
                <span style={styles.kycHeaderText}>KYC Details</span>
                <span style={styles.kycHeaderBadge}>Required</span>
              </div>
              <div style={styles.kycBody}>
                <div style={styles.row}>
                  <div style={styles.col}>
                    <label style={styles.label}>
                      PAN Number <span style={styles.requiredMark}>*</span>
                    </label>
                    <input name="pan" style={styles.input} value={form.pan} onChange={handleChange} placeholder="ABCDE1234F" maxLength={10} />
                  </div>
                  <div style={styles.col}>
                    <label style={styles.label}>
                      Aadhaar Number <span style={styles.requiredMark}>*</span>
                    </label>
                    <input name="aadhaar" style={styles.input} value={form.aadhaar} onChange={handleChange} placeholder="12-digit" maxLength={12} />
                  </div>
                </div>
                <p style={styles.kycNote}>
                  Verified securely via Aadhaar OTP and PAN validation after you sign in.
                </p>
              </div>
            </div>

            <label style={styles.label}>
              Password <span style={styles.requiredMark}>*</span>
            </label>
            <input name="password" type="password" style={styles.input} value={form.password} onChange={handleChange} placeholder="At least 8 characters" />

            <label style={styles.label}>
              Confirm Password <span style={styles.requiredMark}>*</span>
            </label>
            <input name="confirmPassword" type="password" style={styles.input} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" />

            <label style={styles.termsRow}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                style={styles.checkbox}
              />
              <span>
                I agree to the <span style={styles.link}>Terms & Conditions</span> and{" "}
                <span style={styles.link}>Privacy Policy</span>
                <span style={styles.requiredMark}> *</span>
              </span>
            </label>

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>

            <p style={styles.footer}>
              Already have an account?
              <span style={styles.link} onClick={() => router.push("/customer/login")}>
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIconWrap}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5L9 17.5L20 6.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeDasharray: 40, animation: "checkDraw 0.5s ease-out 0.15s both" }}
                />
              </svg>
            </div>
            <h3 style={styles.modalTitle}>Registration Successful</h3>
            <p style={styles.modalText}>Your account has been created. Redirecting you to sign in…</p>
            <div style={styles.modalSpinner} />
          </div>
        </div>
      )}
    </div>
  );
}

function ReqRow({ text }) {
  return (
    <div style={styles.reqRow}>
      <span style={styles.reqDot} />
      <span>{text}</span>
    </div>
  );
}

const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_DISPLAY = "'Source Serif 4', Georgia, serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";

const styles = {
  page: { background: "#F7F8FA", fontFamily: FONT_BODY, color: "#101828" },

  panel: {
    background: "linear-gradient(160deg, #0E1420 0%, #161D2C 100%)",
    color: "#E7EAF0",
    padding: "48px 44px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "100vh",
  },
  panelTop: { display: "flex", alignItems: "center", gap: "12px" },
  panelLogoWrap: { background: "#FFFFFF", borderRadius: "8px", padding: "8px 14px", display: "inline-flex", alignItems: "center" },
  panelLogo: { height: "22px", width: "auto", objectFit: "contain", display: "block" },
  panelTag: { fontFamily: FONT_MONO, fontSize: "10.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#7C8AA8" },
  panelMid: { maxWidth: "380px" },
  panelHeadline: { fontFamily: FONT_DISPLAY, fontSize: "32px", lineHeight: 1.2, fontWeight: 500, margin: "0 0 16px", color: "#FFFFFF" },
  panelSub: { fontSize: "14.5px", lineHeight: 1.6, color: "#9AA5BD", margin: "0 0 24px" },

  reqList: { display: "flex", flexDirection: "column", gap: "10px" },
  reqRow: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#C3CBDD" },
  reqDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#3DDC84", flexShrink: 0 },

  panelFooter: { fontFamily: FONT_MONO, fontSize: "10.5px", color: "#5E6B87", letterSpacing: "0.04em" },

  formSide: { display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  card: { width: "100%", maxWidth: "560px" },

  title: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "26px", margin: "0 0 6px", color: "#101828" },
  sub: { color: "#667085", marginBottom: "26px", fontSize: "13.5px" },
  requiredMark: { color: "#DC2626", fontWeight: 700 },

  row: { display: "flex", gap: "14px" },
  col: { flex: 1 },

  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px", marginTop: "2px" },
  input: {
    width: "100%", padding: "12px 14px", marginBottom: "16px", borderRadius: "8px",
    border: "1px solid #D9DEE6", fontSize: "14.5px", outline: "none", boxSizing: "border-box",
    background: "#fff", color: "#101828",
  },

  sectionDivider: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginTop: "6px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #EDF0F4",
  },
  sectionDividerText: { fontSize: "12.5px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.04em" },
  optionalTag: {
    fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 500, color: "#6B7280",
    background: "#F3F4F6", padding: "3px 9px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.04em",
  },

  kycBox: { background: "#FAFBFC", border: "1px solid #EDF0F4", borderRadius: "10px", marginBottom: "18px", overflow: "hidden" },
  kycHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #EDF0F4", background: "#F5F7FA" },
  kycHeaderText: { fontFamily: FONT_MONO, fontSize: "11px", fontWeight: 500, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.06em" },
  kycHeaderBadge: { fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 500, color: "#92620A", background: "#FDF3E0", padding: "3px 9px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.04em" },
  kycBody: { padding: "16px" },
  kycNote: { fontSize: "11.5px", color: "#9AA2B1", margin: "4px 0 0", lineHeight: 1.5 },

  termsRow: { display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#4B5563", marginBottom: "16px", cursor: "pointer" },
  checkbox: { marginTop: "3px", cursor: "pointer" },

  button: { width: "100%", padding: "13px", background: "#2451B8", border: "none", borderRadius: "8px", color: "#fff", fontSize: "15px", cursor: "pointer", fontWeight: 600, marginTop: "6px" },
  buttonDisabled: { background: "#B7C6E8", cursor: "not-allowed" },

  error: { color: "#B3261E", background: "#FCEEED", border: "1px solid #F5D0CC", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center", fontSize: "13px" },

  footer: { textAlign: "center", marginTop: "22px", color: "#667085", fontSize: "13.5px" },
  link: { marginLeft: "6px", color: "#2451B8", cursor: "pointer", fontWeight: 600 },

  modalOverlay: {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    background: "rgba(16,24,40,0.55)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 3000,
  },
  modalCard: {
    background: "#fff", borderRadius: "16px", padding: "36px 32px",
    width: "340px", textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    animation: "popIn 0.25s ease-out",
  },
  modalIconWrap: {
    width: "60px", height: "60px", borderRadius: "50%", background: "#16A34A",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px",
  },
  modalTitle: { fontFamily: FONT_DISPLAY, fontSize: "19px", fontWeight: 600, color: "#101828", margin: "0 0 8px" },
  modalText: { fontSize: "13.5px", color: "#667085", margin: "0 0 18px", lineHeight: 1.5 },
  modalSpinner: {
    width: "22px", height: "22px", border: "3px solid #E5E7EB", borderTopColor: "#2451B8",
    borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite",
  },
};