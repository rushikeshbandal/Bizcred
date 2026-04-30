"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setSuccess("Login successful ✅");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={container}>
      
      {/* LEFT SIDE (Branding) */}
      <div style={left}>
        <h1 style={logo}>💳 BizCred</h1>
        <p style={tagline}>
          Secure • Fast • Smart <br />
          Fintech Admin Panel
        </p>
      </div>

      {/* RIGHT SIDE (LOGIN CARD) */}
      <div style={right}>
        <div style={card}>
          <h2 style={title}>🔐 Welcome Back</h2>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          {error && <p style={errorText}>{error}</p>}
          {success && <p style={successText}>{success}</p>}

          <button onClick={handleLogin} style={button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

//
// 🎨 STYLES (ADVANCED)
//

const container = {
  height: "100vh",
  display: "flex",
  background: "linear-gradient(135deg,#667eea,#764ba2)",
};

const left = {
  flex: 1,
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  paddingLeft: "80px",
};

const logo = {
  fontSize: "40px",
  fontWeight: "bold",
};

const tagline = {
  marginTop: "20px",
  fontSize: "18px",
  opacity: 0.9,
};

const right = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const card = {
  width: "360px",
  padding: "35px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  color: "#fff",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.2)",
  color: "#fff",
};

const button = {
  width: "100%",
  padding: "12px",
  background: "#fff",
  color: "#667eea",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "10px",
};

const errorText = {
  color: "#ff4d4f",
  fontSize: "14px",
};

const successText = {
  color: "#4caf50",
  fontSize: "14px",
};