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
      
      {/* LEFT SIDE */}
      <div style={left}>
        <img 
          src="/BizCred-logo.png" 
          alt="BizCred Logo" 
          style={logoImg}
        />

        <p style={tagline}>
          Secure • Fast • Smart <br />
          Fintech Admin Panel
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div style={right}>
        <div style={card}>
          <h2 style={title}>Welcome Back</h2>

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
// 🎨 STYLES (WHITE PROFESSIONAL UI)
//

const container = {
  height: "100vh",
  display: "flex",
  background: "#ffffff", // ✅ WHITE BACKGROUND
};

const left = {
  flex: 1,
  background: "#f5f7ff", // light soft background
  color: "#333",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const logoImg = {
  width: "220px",
  marginBottom: "20px",
};

const tagline = {
  fontSize: "18px",
  color: "#555",
  textAlign: "center",
};

const right = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#ffffff",
};

const card = {
  width: "360px",
  padding: "35px",
  borderRadius: "16px",
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#333",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  outline: "none",
  color: "#333",
};

const button = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(90deg,#667eea,#764ba2)",
  color: "#fff",
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