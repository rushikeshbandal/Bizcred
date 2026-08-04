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

  const [clock, setClock] = useState("");

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

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

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
      setError("Camera is still loading. Please try again in a moment.");
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
      setError("");
    } else {
      setError("Couldn't capture a clear photo. Please try again.");
    }
  };

  const retakeSelfie = () => {
    setSelfieData(null);
    setSelfieCaptured(false);
  };

  const verificationReady =
    locationStatus === "granted" && cameraStatus === "granted" && selfieCaptured;

  const submitCredentials = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter Email and Password");
      return;
    }

    if (!verificationReady) {
      setError("Please capture your selfie and allow location access to continue.");
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

  const geoLabel =
    locationStatus === "granted" && location.latitude
      ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`
      : locationStatus === "denied"
      ? "BLOCKED"
      : "LOCATING…";

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(220%); }
        }
        @keyframes blink {
          0%, 45% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .bc-cursor { animation: blink 1.1s step-end infinite; }

        .bc-shell { display: flex; min-height: 100vh; }
        .bc-panel { flex: 0 0 42%; }
        .bc-formside { flex: 1; }

        @media (max-width: 860px) {
          .bc-shell { flex-direction: column; }
          .bc-panel { flex: none; }
          .bc-console { display: none; }
        }
      `}</style>

      <div className="bc-shell">
        {/* LEFT — BRAND / SECURITY CONSOLE */}
        <div className="bc-panel" style={styles.panel}>
          <div style={styles.panelTop}>
            <div style={styles.panelLogoWrap}>
              <img src="/BizCred-logo.png" alt="BizCred" style={styles.panelLogo} />
            </div>
            <span style={styles.panelTag}>Business Credit Platform</span>
          </div>

          <div style={styles.panelMid}>
            <h1 style={styles.panelHeadline}>
              Every sign-in,
              <br />
              independently verified.
            </h1>
            <p style={styles.panelSub}>
              BizCred confirms your device, location and identity before granting
              access to your account — no exceptions.
            </p>
          </div>

          <div className="bc-console" style={styles.console}>
            <div style={styles.consoleHeader}>
              <span style={styles.consoleDot} />
              VERIFICATION CONSOLE
            </div>
            <div style={styles.consoleBody}>
              <ConsoleRow label="SESSION" value={clock || "--:--:--"} />
              <ConsoleRow
                label="CAMERA"
                value={cameraStatus === "granted" ? "LINKED" : cameraStatus.toUpperCase()}
              />
              <ConsoleRow label="GEO" value={geoLabel} />
              <ConsoleRow
                label="SELFIE"
                value={selfieCaptured ? "CAPTURED" : "AWAITING"}
              />
              <div style={styles.consolePrompt}>
                <span>{"> awaiting_credentials"}</span>
                <span className="bc-cursor">_</span>
              </div>
            </div>
          </div>

          <p style={styles.panelFooter}>256-bit encryption · Fraud monitoring active</p>
        </div>

        {/* RIGHT — FORM */}
        <div className="bc-formside" style={styles.formSide}>
          <div style={styles.card}>
            {step === "credentials" ? (
              <>
                <h2 style={styles.title}>Sign in</h2>
                <p style={styles.sub}>Enter your credentials to access your account</p>

                <div style={styles.verifyBox}>
                  <div style={styles.verifyHeader}>
                    <span style={styles.verifyHeaderText}>Identity Verification</span>
                    <span
                      style={{
                        ...styles.verifyHeaderBadge,
                        ...(verificationReady ? styles.verifyHeaderBadgeDone : {}),
                      }}
                    >
                      {verificationReady ? "Complete" : "Required"}
                    </span>
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
                      {!selfieCaptured && cameraStatus === "granted" && (
                        <span style={styles.scanline} />
                      )}
                      {selfieCaptured && selfieData && (
                        <img src={selfieData} alt="Captured selfie" style={styles.selfiePreview} />
                      )}
                      {selfieCaptured && <div style={styles.checkBadge}>✓</div>}
                    </div>

                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    <div style={styles.statusList}>
                      <StatusChip label="Camera" status={cameraStatus} />
                      <StatusChip label="Location" status={locationStatus} />
                      <StatusChip label="Selfie" status={selfieCaptured ? "granted" : "pending"} />
                    </div>
                  </div>

                  <div style={styles.captureRow}>
                    {!selfieCaptured ? (
                      <button
                        type="button"
                        style={{
                          ...styles.captureBtn,
                          ...(cameraStatus !== "granted" ? styles.captureBtnDisabled : {}),
                        }}
                        onClick={takeSelfie}
                        disabled={cameraStatus !== "granted"}
                      >
                        Capture selfie
                      </button>
                    ) : (
                      <button type="button" style={styles.retakeBtn} onClick={retakeSelfie}>
                        Retake photo
                      </button>
                    )}
                  </div>

                  <p style={styles.verifyNote}>
                    Your selfie and location are captured on every sign-in for account security.
                  </p>
                </div>

                <label style={styles.label}>Email address</label>
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
                    ? "Please wait…"
                    : !verificationReady
                    ? "Complete verification to continue"
                    : "Continue"}
                </button>
              </>
            ) : (
              <>
                <h2 style={styles.title}>Verify your email</h2>
                <p style={styles.sub}>
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>

                <label style={styles.label}>Verification code</label>
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
                  {loading ? "Verifying…" : "Verify & sign in"}
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
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
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
      </div>
    </div>
  );
}

function ConsoleRow({ label, value }) {
  return (
    <div style={styles.consoleRow}>
      <span style={styles.consoleLabel}>{label}</span>
      <span style={styles.consoleValue}>{value}</span>
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
  panelLogoWrap: {
    background: "#FFFFFF",
    borderRadius: "8px",
    padding: "8px 14px",
    display: "inline-flex",
    alignItems: "center",
  },
  panelLogo: { height: "22px", width: "auto", objectFit: "contain", display: "block" },
  panelTag: {
    fontFamily: FONT_MONO,
    fontSize: "10.5px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#7C8AA8",
  },
  panelMid: { maxWidth: "380px" },
  panelHeadline: {
    fontFamily: FONT_DISPLAY,
    fontSize: "34px",
    lineHeight: 1.2,
    fontWeight: 500,
    margin: "0 0 16px",
    color: "#FFFFFF",
  },
  panelSub: { fontSize: "14.5px", lineHeight: 1.6, color: "#9AA5BD", margin: 0 },

  console: {
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  consoleHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: FONT_MONO,
    fontSize: "10.5px",
    letterSpacing: "0.1em",
    color: "#7C8AA8",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  consoleDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#3DDC84",
    boxShadow: "0 0 0 3px rgba(61,220,132,0.15)",
  },
  consoleBody: { padding: "14px 16px", fontFamily: FONT_MONO, fontSize: "12px" },
  consoleRow: { display: "flex", justifyContent: "space-between", padding: "5px 0", color: "#C3CBDD" },
  consoleLabel: { color: "#5E6B87" },
  consoleValue: { color: "#E7EAF0" },
  consolePrompt: { marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#3DDC84" },

  panelFooter: { fontFamily: FONT_MONO, fontSize: "10.5px", color: "#5E6B87", letterSpacing: "0.04em" },

  formSide: { display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" },
  card: { width: "100%", maxWidth: "400px" },

  title: { fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: "26px", margin: "0 0 6px", color: "#101828" },
  sub: { color: "#667085", marginBottom: "26px", fontSize: "14px" },

  verifyBox: { background: "#FAFBFC", border: "1px solid #EDF0F4", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" },
  verifyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #EDF0F4", background: "#F5F7FA" },
  verifyHeaderText: { fontFamily: FONT_MONO, fontSize: "11px", fontWeight: 500, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.06em" },
  verifyHeaderBadge: { fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 500, color: "#92620A", background: "#FDF3E0", padding: "3px 9px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.04em" },
  verifyHeaderBadgeDone: { color: "#0F7A3D", background: "#E9F8EF" },
  verifyBody: { display: "flex", alignItems: "center", gap: "16px", padding: "16px" },

  avatarWrap: { position: "relative", width: "64px", height: "64px", flexShrink: 0, borderRadius: "50%", overflow: "hidden" },
  video: { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", background: "#E5E7EB", border: "2px solid #2451B8" },
  scanline: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: "18px",
    background: "linear-gradient(180deg, rgba(36,81,184,0) 0%, rgba(36,81,184,0.5) 50%, rgba(36,81,184,0) 100%)",
    animation: "scanline 2.2s linear infinite",
    pointerEvents: "none",
  },
  selfiePreview: { width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #16A34A" },
  checkBadge: { position: "absolute", bottom: "-2px", right: "-2px", width: "20px", height: "20px", borderRadius: "50%", background: "#16A34A", color: "#fff", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #FAFBFC" },

  statusList: { display: "flex", flexDirection: "column", gap: "8px", flex: 1 },
  chip: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  chipLabel: { fontSize: "12.5px", color: "#374151", fontWeight: 500 },
  chipStatus: { fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 500, padding: "3px 9px", borderRadius: "20px", letterSpacing: "0.04em", textTransform: "uppercase" },

  captureRow: { padding: "0 16px 14px" },
  captureBtn: { width: "100%", padding: "10px", background: "#111827", border: "none", borderRadius: "8px", color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" },
  captureBtnDisabled: { background: "#D1D5DB", cursor: "not-allowed" },
  retakeBtn: { width: "100%", padding: "10px", background: "#fff", border: "1px solid #D9DEE6", borderRadius: "8px", color: "#374151", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" },
  verifyNote: { fontSize: "11.5px", color: "#9AA2B1", padding: "10px 16px 14px", margin: 0, lineHeight: 1.5, borderTop: "1px solid #EDF0F4" },

  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #D9DEE6", fontSize: "14.5px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#101828" },
  otpInput: { textAlign: "center", fontFamily: FONT_MONO, fontSize: "22px", letterSpacing: "10px", fontWeight: 500 },

  button: { width: "100%", padding: "13px", background: "#2451B8", border: "none", borderRadius: "8px", color: "#fff", fontSize: "15px", cursor: "pointer", fontWeight: 600, marginTop: "6px" },
  buttonDisabled: { background: "#B7C6E8", cursor: "not-allowed" },

  error: { color: "#B3261E", background: "#FCEEED", border: "1px solid #F5D0CC", padding: "10px 12px", borderRadius: "8px", marginBottom: "16px", textAlign: "center", fontSize: "13px" },
  resendRow: { textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#667085" },
  linkDisabled: { color: "#9CA3AF", cursor: "default", fontWeight: 500 },
  backLink: { textAlign: "center", marginTop: "14px", fontSize: "13px", color: "#667085", cursor: "pointer" },

  footer: { textAlign: "center", marginTop: "22px", color: "#667085", fontSize: "13.5px" },
  link: { marginLeft: "6px", color: "#2451B8", cursor: "pointer", fontWeight: 600 },
};