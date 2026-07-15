"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerLogin() {
  const router = useRouter();

  const [step, setStep] = useState("credentials"); // "credentials" | "otp"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [resendTimer, setResendTimer] = useState(0);

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locationStatus, setLocationStatus] = useState("pending");
  const [cameraStatus, setCameraStatus] = useState("pending");

  const [selfieData, setSelfieData] = useState(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocationStatus("granted");
        },
        () => setLocationStatus("denied")
      );
    } else {
      setLocationStatus("denied");
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCameraStatus("granted");
            setTimeout(() => takeSelfie(), 700);
          };
        }
      } catch (err) {
        setCameraStatus("denied");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const takeSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      setTimeout(takeSelfie, 300);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

    if (dataUrl && dataUrl.length > 5000) {
      setSelfieData(dataUrl);
      setSelfieCaptured(true);
    } else {
      setTimeout(takeSelfie, 400);
    }
  };

  const verificationReady =
    locationStatus === "granted" && cameraStatus === "granted" && selfieCaptured;

  // ---- Step 1: submit credentials, request OTP ----
  const submitCredentials = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Email and Password");
      return;
    }

    if (!verificationReady) {
      setError("Please allow camera and location access to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          selfie: selfieData,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await res.json();

      if (data.success && data.step === "otp_required") {
        setStep("otp");
        setResendTimer(30);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  // ---- Step 2: submit OTP, get JWT ----
  const submitOtp = async () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("customerToken", data.token);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        router.push("/customer/dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          selfie: selfieData,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResendTimer(30);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src="/BizCred-logo.png" alt="BizCred" style={styles.logo} />

        {step === "credentials" ? (
          <>
            <h2 style={styles.title}>Sign in to BizCred</h2>
            <p style={styles.sub}>Enter your credentials to access your account</p>

            <div style={styles.verifyBox}>
              <div style={styles.verifyHeader}>
                <span style={styles.verifyHeaderText}>Identity Verification</span>
              </div>

              <div style={styles.verifyBody}>
                <div style={styles.avatarWrap}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{
                      ...styles.video,
                      display: selfieCaptured ? "none" : "block",
                    }}
                  />
                  {selfieCaptured && selfieData && (
                    <img src={selfieData} alt="Captured selfie" style={styles.selfiePreview} />
                  )}
                  {selfieCaptured && <div style={styles.checkBadge}>✓</div>}
                </div>

                <canvas ref={canvasRef} style={{ display: "none" }} />

                <div style={styles.statusList}>
                  <StatusChip
                    label="Camera"
                    status={
                      cameraStatus === "granted"
                        ? selfieCaptured
                          ? "granted"
                          : "pending"
                        : cameraStatus
                    }
                  />
                  <StatusChip label="Location" status={locationStatus} />
                </div>
              </div>

              <p style={styles.verifyNote}>
                Your selfie and location are captured on every sign-in for account security.
              </p>
            </div>

            <div style={styles.divider} />

            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={{
                ...styles.button,
                ...(loading || !verificationReady ? styles.buttonDisabled : {}),
              }}
              onClick={submitCredentials}
              disabled={loading || !verificationReady}
            >
              {loading
                ? "Please wait..."
                : !verificationReady
                ? "Waiting for Verification..."
                : "Continue"}
            </button>
          </>
        ) : (
          <>
            <h2 style={styles.title}>Verify your email</h2>
            <p style={styles.sub}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <label style={styles.label}>Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              style={{ ...styles.input, ...styles.otpInput }}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            {error && <p style={styles.error}>{error}</p>}

            <button
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onClick={submitOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <p style={styles.resendRow}>
              Didn't receive the code?{" "}
              <span
                style={{
                  ...styles.link,
                  ...(resendTimer > 0 ? styles.linkDisabled : {}),
                }}
                onClick={resendOtp}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </span>
            </p>

            <p
              style={styles.backLink}
              onClick={() => {
                setStep("credentials");
                setOtp("");
                setError("");
              }}
            >
              ← Back to login
            </p>
          </>
        )}

        <div style={styles.trustRow}>
          <span style={styles.trustItem}>256-bit Encryption</span>
          <span style={styles.trustDot}>•</span>
          <span style={styles.trustItem}>Fraud Protected</span>
        </div>

        {step === "credentials" && (
          <p style={styles.footer}>
            Don't have an account?
            <span style={styles.link} onClick={() => router.push("/customer/register")}>
              Register
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function StatusChip({ label, status }) {
  const config = {
    pending: { color: "#92620a", bg: "#fdf3e0", text: "Pending" },
    granted: { color: "#0f7a3d", bg: "#e9f8ef", text: "Verified" },
    denied: { color: "#b3261e", bg: "#fceeed", text: "Blocked" },
  }[status];

  return (
    <div style={styles.chip}>
      <span style={styles.chipLabel}>{label}</span>
      <span style={{ ...styles.chipStatus, color: config.color, background: config.bg }}>
        {config.text}
      </span>
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
    width: "420px",
    background: "#ffffff",
    padding: "40px 36px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
  },
  logo: { display: "block", margin: "0 auto 24px", height: "48px", objectFit: "contain" },
  title: { textAlign: "center", marginBottom: "6px", color: "#111827", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.3px" },
  sub: { textAlign: "center", color: "#6b7280", marginBottom: "28px", fontSize: "13.5px" },
  verifyBox: { background: "#fafbfc", border: "1px solid #edf0f4", borderRadius: "10px", marginBottom: "22px", overflow: "hidden" },
  verifyHeader: { padding: "12px 16px", borderBottom: "1px solid #edf0f4", background: "#f5f7fa" },
  verifyHeaderText: { fontSize: "11.5px", fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.5px" },
  verifyBody: { display: "flex", alignItems: "center", gap: "16px", padding: "16px" },
  avatarWrap: { position: "relative", width: "64px", height: "64px", flexShrink: 0 },
  video: { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", background: "#e5e7eb", border: "2px solid #2563eb" },
  selfiePreview: { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #16a34a" },
  checkBadge: { position: "absolute", bottom: "-2px", right: "-2px", width: "20px", height: "20px", borderRadius: "50%", background: "#16a34a", color: "#fff", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fafbfc" },
  statusList: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  chip: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  chipLabel: { fontSize: "13px", color: "#374151", fontWeight: 500 },
  chipStatus: { fontSize: "10.5px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px", letterSpacing: "0.3px", textTransform: "uppercase" },
  verifyNote: { fontSize: "11.5px", color: "#9aa2b1", padding: "10px 16px 14px", margin: 0, lineHeight: 1.5, borderTop: "1px solid #edf0f4" },
  divider: { height: "1px", background: "#f0f1f3", marginBottom: "20px" },
  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #d9dee6", fontSize: "14.5px", outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#111827" },
  otpInput: { textAlign: "center", fontSize: "22px", letterSpacing: "10px", fontWeight: 700 },
  button: { width: "100%", padding: "13px", background: "#1d4ed8", border: "none", borderRadius: "8px", color: "#fff", fontSize: "15px", cursor: "pointer", fontWeight: 600, marginTop: "6px" },
  buttonDisabled: { background: "#c3d0f0", cursor: "not-allowed" },
  error: { color: "#b3261e", background: "#fceeed", border: "1px solid #f5d0cc", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center", fontSize: "13px" },
  resendRow: { textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#6b7280" },
  linkDisabled: { color: "#9ca3af", cursor: "default", fontWeight: 500 },
  backLink: { textAlign: "center", marginTop: "14px", fontSize: "13px", color: "#6b7280", cursor: "pointer" },
  trustRow: { display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" },
  trustItem: { fontSize: "11px", color: "#9ca3af", fontWeight: 500 },
  trustDot: { fontSize: "11px", color: "#d1d5db" },
  footer: { textAlign: "center", marginTop: "22px", color: "#6b7280", fontSize: "13.5px" },
  link: { marginLeft: "6px", color: "#1d4ed8", cursor: "pointer", fontWeight: 600 },
};