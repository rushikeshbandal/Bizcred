"use client";
import { useState } from "react";

export default function AddUserPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    setLoading(true);

    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ User created successfully");
      setForm({ name: "", email: "", password: "" });
    } else {
      alert("❌ " + (data.message || "Failed"));
    }

    setLoading(false);
  };

  return (
    <div style={container}>
      <h1 style={title}>➕ Add New User</h1>

      <div style={card}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={input}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={input}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={input}
        />

        <button onClick={handleSubmit} style={btn} disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </div>
  );
}

//
//  STYLES
//

const container = {
  padding: "20px",
  background: "#f5f5f5",
  minHeight: "100vh",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
};

const card = {
  maxWidth: "400px",
  margin: "auto",
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const btn = {
  width: "100%",
  padding: "10px",
  background: "#667eea",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};