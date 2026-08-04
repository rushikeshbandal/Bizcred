"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [changeMessage, setChangeMessage] = useState("");

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch("/api/admin/security/admins", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();
      if (data.success) setAdmins(data.admins);
    } catch (err) {
      console.error(err);
    }
    setLoadingAdmins(false);
  };

  const handleChangePassword = async () => {
    setChangeMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangeMessage("❌ Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeMessage("❌ New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setChangeMessage("❌ New password must be at least 8 characters.");
      return;
    }

    setChanging(true);
    try {
      const res = await fetch("/api/admin/security/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setChangeMessage("✅ Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setChangeMessage("❌ " + (data.message || "Failed to update password."));
      }
    } catch (err) {
      setChangeMessage("❌ Something went wrong.");
    }
    setChanging(false);
  };

  const handleCreateAdmin = async () => {
    setCreateMessage("");

    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword) {
      setCreateMessage("❌ Please fill all fields.");
      return;
    }
    if (newAdminPassword.length < 8) {
      setCreateMessage("❌ Password must be at least 8 characters.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/security/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ name: newAdminName, email: newAdminEmail, password: newAdminPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setCreateMessage("✅ Admin account created.");
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        loadAdmins();
      } else {
        setCreateMessage("❌ " + (data.message || "Failed to create admin."));
      }
    } catch (err) {
      setCreateMessage("❌ Something went wrong.");
    }
    setCreating(false);
  };

  return (
    <AdminShell pageTitle="🔐 Security" pageSubtitle="Manage your password and admin accounts">
      {/* CHANGE PASSWORD */}
      <div style={card}>
        <h2 style={cardTitle}>Change Your Password</h2>

        <label style={label}>Current Password</label>
        <input
          type="password"
          style={input}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label style={label}>New Password</label>
        <input
          type="password"
          style={input}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label style={label}>Confirm New Password</label>
        <input
          type="password"
          style={input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {changeMessage && <p style={messageStyle}>{changeMessage}</p>}

        <button
          style={{ ...button, ...(changing ? buttonDisabled : {}) }}
          onClick={handleChangePassword}
          disabled={changing}
        >
          {changing ? "Updating..." : "Update Password"}
        </button>
      </div>

      {/* ADMIN ACCOUNTS */}
      <div style={card}>
        <h2 style={cardTitle}>Admin Accounts</h2>

        {loadingAdmins ? (
          <p style={mutedText}>Loading...</p>
        ) : (
          <div style={adminList}>
            {admins.map((a) => (
              <div key={a._id} style={adminRow}>
                <div>
                  <p style={adminName}>{a.name}</p>
                  <p style={adminEmail}>{a.email}</p>
                </div>
                <p style={adminDate}>
                  Added {new Date(a.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={divider} />

        <h3 style={subTitle}>Add New Admin</h3>

        <label style={label}>Name</label>
        <input style={input} value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} />

        <label style={label}>Email</label>
        <input style={input} value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />

        <label style={label}>Password</label>
        <input
          type="password"
          style={input}
          value={newAdminPassword}
          onChange={(e) => setNewAdminPassword(e.target.value)}
        />

        {createMessage && <p style={messageStyle}>{createMessage}</p>}

        <button
          style={{ ...button, ...(creating ? buttonDisabled : {}) }}
          onClick={handleCreateAdmin}
          disabled={creating}
        >
          {creating ? "Creating..." : "Create Admin Account"}
        </button>
      </div>
    </AdminShell>
  );
}

const card = {
  background: "#fff",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "20px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  maxWidth: "520px",
};

const cardTitle = { marginTop: 0, marginBottom: "18px", fontSize: "16px" };
const subTitle = { marginTop: 0, marginBottom: "14px", fontSize: "14px" };

const label = { display: "block", marginBottom: "6px", marginTop: "12px", fontWeight: 600, fontSize: "13px", color: "#374151" };

const input = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #d9dee6",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const button = {
  marginTop: "18px",
  width: "100%",
  padding: "12px",
  background: "#667eea",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontWeight: 600,
  cursor: "pointer",
};

const buttonDisabled = { opacity: 0.6, cursor: "not-allowed" };

const messageStyle = { marginTop: "14px", fontSize: "13.5px" };

const mutedText = { color: "#9ca3af", fontSize: "13.5px" };

const adminList = { display: "flex", flexDirection: "column", gap: "10px" };

const adminRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 0",
  borderBottom: "1px solid #f3f4f6",
};

const adminName = { margin: 0, fontWeight: 600, fontSize: "14px" };
const adminEmail = { margin: "2px 0 0", fontSize: "12.5px", color: "#6b7280" };
const adminDate = { margin: 0, fontSize: "12px", color: "#9ca3af" };

const divider = { height: 1, background: "#f0f1f3", margin: "20px 0" };