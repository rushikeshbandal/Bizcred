"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    pan: "",
    aadhaar: "",
    aiScore: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // ⚠️ NOTE: this score is NOT a real credit model — it's a rough demo
  // heuristic, and the Math.random() term below means it changes every
  // time this page reloads for the same user. Do not use this to drive
  // real lending/credit decisions until it's replaced with a real model.
  const calculateAiScore = (u) => {
    let score = 500;

    if ((u.wallet?.balance || 0) > 50000) score += 120;
    else if ((u.wallet?.balance || 0) > 10000) score += 70;
    else score += 20;

    if (u.kyc?.pan) score += 80;
    if (u.kyc?.aadhaar) score += 80;

    if (u.status === "active") score += 100;
    if (u.status === "blocked") score -= 150;
    if (u.status === "suspended") score -= 80;

    score += Math.floor(Math.random() * 50);

    if (score > 900) score = 900;

    return score;
  };

  const loadUsers = async () => {
    const res = await fetch("/api/users/list", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await res.json();

    const usersWithScore = (data.users || []).map((u) => ({
      ...u,
      aiCreditScore: calculateAiScore(u),
    }));

    setUsers(usersWithScore);
  };

  const handleStatusChange = async (userId, status) => {
    const res = await fetch("/api/users/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId, status }),
    });

    const data = await res.json();
    alert(data.message);
    loadUsers();
  };

  const openEdit = (u) => {
    setEditUser(u._id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      pan: u.kyc?.pan || "",
      aadhaar: u.kyc?.aadhaar || "",
      aiScore: u.aiCreditScore || "",
    });
  };

  const handleUpdate = async () => {
    // Note: this only updates local state — no API call is made,
    // so a page refresh will discard these edits. If you want real
    // persistence, this needs a PUT/PATCH to a users update route.
    const updatedUsers = users.map((u) =>
      u._id === editUser
        ? {
            ...u,
            name: form.name,
            email: form.email,
            aiCreditScore: form.aiScore,
            kyc: { ...u.kyc, pan: form.pan, aadhaar: form.aadhaar },
          }
        : u
    );

    setUsers(updatedUsers);
    alert("User Updated (local only — not saved to database yet)");
    setEditUser(null);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure to delete this user?")) return;

    const res = await fetch("/api/users/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId: editUser }),
    });

    const data = await res.json();
    alert(data.message);
    setEditUser(null);
    loadUsers();
  };

  const getScoreColor = (score) => {
    if (score >= 750) return "#16a34a";
    if (score >= 650) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreText = (score) => {
    if (score >= 750) return "Excellent";
    if (score >= 650) return "Good";
    return "Risky";
  };

  return (
    <AdminShell pageTitle="👤 User Management" pageSubtitle="View, edit, and manage customer accounts">
      <div style={grid}>
        {users.map((u) => (
          <div key={u._id} style={card}>
            <div style={header}>
              <div style={avatar}>{u.name?.charAt(0)?.toUpperCase()}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0 }}>{u.name}</h3>
                <p style={email}>{u.email}</p>
                <p style={kycText}>PAN: {u.kyc?.pan || "Not Provided"}</p>
                <p style={kycText}>Aadhaar: {u.kyc?.aadhaar ? `XXXX XXXX ${u.kyc.aadhaar}` : "Not Provided"}</p>
              </div>

              <span style={editIcon} onClick={() => openEdit(u)}>
                ✏️
              </span>

              <span style={statusBadge(u.status)}>{u.status || "active"}</span>
            </div>

            <div style={scoreBox}>
              <div
                style={{
                  ...scoreCircle,
                  borderColor: getScoreColor(u.aiCreditScore),
                  color: getScoreColor(u.aiCreditScore),
                }}
              >
                {u.aiCreditScore}
              </div>

              <div>
                <h4 style={{ margin: 0 }}>🤖 AI Credit Score</h4>
                <p style={{ color: getScoreColor(u.aiCreditScore), fontWeight: "bold", margin: "5px 0" }}>
                  {getScoreText(u.aiCreditScore)}
                </p>
                <p style={aiText}>Demo heuristic — not a certified credit model</p>
              </div>
            </div>

            <div style={statusRow}>
              <button onClick={() => handleStatusChange(u._id, "active")} style={activeBtn}>
                Active
              </button>
              <button onClick={() => handleStatusChange(u._id, "blocked")} style={blockBtn}>
                Block
              </button>
              <button onClick={() => handleStatusChange(u._id, "suspended")} style={suspendBtn}>
                Suspend
              </button>
            </div>
          </div>
        ))}
      </div>

      {editUser && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Edit User</h2>

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
              placeholder="PAN"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value })}
              style={input}
            />
            <input
              placeholder="Aadhaar"
              value={form.aadhaar}
              onChange={(e) => setForm({ ...form, aadhaar: e.target.value })}
              style={input}
            />
            <input
              placeholder="AI Credit Score"
              value={form.aiScore}
              onChange={(e) => setForm({ ...form, aiScore: e.target.value })}
              style={input}
            />

            <div style={modalBtns}>
              <button onClick={handleUpdate} style={saveBtn}>
                Update
              </button>
              <button onClick={handleDelete} style={deleteBtn}>
                Delete
              </button>
              <button onClick={() => setEditUser(null)} style={cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px" };

const card = { background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 5px 15px rgba(0,0,0,0.06)" };

const header = { display: "flex", alignItems: "center", gap: "10px" };

const avatar = {
  width: 50, height: 50, borderRadius: "50%", flexShrink: 0,
  background: "linear-gradient(135deg,#667eea,#764ba2)", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px",
};

const email = { fontSize: "12px", color: "gray", margin: "2px 0" };
const kycText = { fontSize: "12px", color: "#555", margin: "2px 0" };
const aiText = { fontSize: "12px", color: "#666", margin: 0 };
const editIcon = { cursor: "pointer", fontSize: "18px", flexShrink: 0 };

const statusBadge = (status) => ({
  padding: "5px 10px", borderRadius: "20px", fontSize: "12px", flexShrink: 0,
  background: status === "blocked" ? "#ffe5e5" : status === "suspended" ? "#fff4e5" : "#e6f7ee",
  color: status === "blocked" ? "red" : status === "suspended" ? "orange" : "green",
});

const scoreBox = {
  marginTop: "18px", display: "flex", alignItems: "center", gap: "15px",
  padding: "15px", borderRadius: "14px", background: "#f8fafc",
};

const scoreCircle = {
  width: "75px", height: "75px", borderRadius: "50%", border: "6px solid", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px", background: "#fff",
};

const statusRow = { display: "flex", gap: "8px", marginTop: "18px" };

const activeBtn = { flex: 1, background: "#16a34a", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };
const blockBtn = { flex: 1, background: "#dc2626", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };
const suspendBtn = { flex: 1, background: "#f59e0b", color: "#fff", border: "none", padding: "10px", borderRadius: "10px", cursor: "pointer", fontWeight: 600 };

const modalOverlay = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000,
};

const modal = { background: "#fff", padding: "25px", borderRadius: "16px", width: "350px" };

const input = { width: "100%", padding: "11px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "14px" };

const modalBtns = { display: "flex", gap: "10px" };
const saveBtn = { background: "#2563eb", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const deleteBtn = { background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const cancelBtn = { background: "#e5e7eb", color: "#111827", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };