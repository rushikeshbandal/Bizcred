"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PINCODE_REGEX = /^\d{6}$/;

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-uppercase PAN as the user types since it's case-sensitive by format
    setForm((prev) => ({
      ...prev,
      [name]: name === "pan" ? value.toUpperCase() : value,
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name.";
    if (!EMAIL_REGEX.test(form.email)) return "Please enter a valid email address.";
    if (!MOBILE_REGEX.test(form.mobile)) return "Please enter a valid 10-digit mobile number.";
    if (!form.gender) return "Please select a gender.";

    if (form.dob) {
      const age = (Date.now() - new Date(form.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) return "You must be at least 18 years old to register.";
    }

    if (form.pincode && !PINCODE_REGEX.test(form.pincode)) return "Pincode must be 6 digits.";
    if (form.pan && !PAN_REGEX.test(form.pan)) return "PAN format is invalid (e.g. ABCDE1234F).";
    if (form.aadhaar && !AADHAAR_REGEX.test(form.aadhaar)) return "Aadhaar must be 12 digits.";

    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";

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
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/customer/login");
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
      <div style={styles.card}>
        <img src="/BizCred-logo.png" alt="BizCred" style={styles.logo} />
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Register to get started with BizCred</p>

        <label style={styles.label}>Full Name</label>
        <input
          name="name"
          style={styles.input}
          value={form.name}
          onChange={handleChange}
          placeholder="Full name"
        />

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              style={styles.input}
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
            />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Mobile Number</label>
            <input
              name="mobile"
              style={styles.input}
              value={form.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile"
              maxLength={10}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>Date of Birth</label>
            <input
              name="dob"
              type="date"
              style={styles.input}
              value={form.dob}
              onChange={handleChange}
            />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Gender</label>
            <select
              name="gender"
              style={styles.input}
              value={form.gender}
              onChange={handleChange}
            >
              {/* FIX: empty value forces a real selection instead of
                  silently submitting the literal string "Gender" */}
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <label style={styles.label}>Address</label>
        <input
          name="address"
          style={styles.input}
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
        />

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>City</label>
            <input
              name="city"
              style={styles.input}
              value={form.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>State</label>
            <input
              name="state"
              style={styles.input}
              value={form.state}
              onChange={handleChange}
              placeholder="State"
            />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Pincode</label>
            <input
              name="pincode"
              style={styles.input}
              value={form.pincode}
              onChange={handleChange}
              placeholder="6-digit"
              maxLength={6}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.col}>
            <label style={styles.label}>PAN Number</label>
            <input
              name="pan"
              style={styles.input}
              value={form.pan}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              maxLength={10}
            />
          </div>
          <div style={styles.col}>
            <label style={styles.label}>Aadhaar Number</label>
            <input
              name="aadhaar"
              style={styles.input}
              value={form.aadhaar}
              onChange={handleChange}
              placeholder="12-digit"
              maxLength={12}
            />
          </div>
        </div>

        <div style={styles.divider} />

        <label style={styles.label}>Password</label>
        <input
          name="password"
          type="password"
          style={styles.input}
          value={form.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
        />

        <label style={styles.label}>Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          style={styles.input}
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter password"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p style={styles.footer}>
          Already have an account?
          <span style={styles.link} onClick={() => router.push("/customer/login")}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#ffffff",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    width: "560px",
    background: "#ffffff",
    padding: "40px 36px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  },
  logo: { display: "block", margin: "0 auto 24px", height: "48px", objectFit: "contain" },
  title: { textAlign: "center", marginBottom: "6px", color: "#111827", fontSize: "20px", fontWeight: 700 },
  sub: { textAlign: "center", color: "#6b7280", marginBottom: "26px", fontSize: "13.5px" },
  row: { display: "flex", gap: "14px" },
  col: { flex: 1 },
  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px", marginTop: "2px" },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #d9dee6",
    fontSize: "14.5px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#111827",
  },
  divider: { height: "1px", background: "#f0f1f3", margin: "6px 0 18px" },
  button: {
    width: "100%",
    padding: "13px",
    background: "#1d4ed8",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: 600,
    marginTop: "6px",
  },
  buttonDisabled: { background: "#c3d0f0", cursor: "not-allowed" },
  error: {
    color: "#b3261e",
    background: "#fceeed",
    border: "1px solid #f5d0cc",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
    textAlign: "center",
    fontSize: "13px",
  },
  footer: { textAlign: "center", marginTop: "22px", color: "#6b7280", fontSize: "13.5px" },
  link: { marginLeft: "6px", color: "#1d4ed8", cursor: "pointer", fontWeight: 600 },
};