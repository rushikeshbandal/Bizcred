"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("All fields are required");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      //  SUCCESS CASE
      if (res.ok && data.success) {
        setSuccess("✅ User registered successfully");
        setError("");

        //  clear inputs
        setName("");
        setEmail("");
        setPassword("");

        //  redirect after 1.5 sec
        setTimeout(() => {
          router.push("/login");
        }, 1500);

      } else {
        //  ERROR CASE
        setError(data.message || "Registration failed");
        setSuccess("");
      }

    } catch (err) {
      setError("❌ Server error, try again");
      setSuccess("");
    }

    setLoading(false);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
          📝 Register
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* ❌ ERROR */}
        {error && <p style={errorStyle}>{error}</p>}

        {/* ✅ SUCCESS */}
        {success && <p style={successStyle}>{success}</p>}

        <button
          onClick={handleRegister}
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={{ textAlign: "center", marginTop: "12px" }}>
          Already have an account?{" "}
          <span onClick={() => router.push("/login")} style={linkStyle}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

//
//  STYLES
//

const containerStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea, #764ba2)"
};

const cardStyle = {
  width: "350px",
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#667eea",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const linkStyle = {
  color: "#667eea",
  cursor: "pointer",
  fontWeight: "bold"
};

const successStyle = {
  color: "green",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "10px"
};

const errorStyle = {
  color: "red",
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: "10px"
};