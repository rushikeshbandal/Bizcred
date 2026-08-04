"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      companyName: "",
      supportEmail: "",
      contactNumber: "",
    },
    email: {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
    },
    kyc: {
      enabled: true,
      provider: "Sandbox.co.in", // was "Didit" — matches your actual KYC provider
      verificationLimit: 5,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setMessage("");

    if (!settings.general.companyName || !settings.general.supportEmail) {
      setMessage("Please fill required fields.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Settings saved successfully");
      } else {
        setMessage("❌ Failed to save settings");
      }
    } catch (error) {
      console.log(error);
      setMessage("❌ Something went wrong");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminShell pageTitle="Settings">
        <div style={loadingStyle}>Loading Settings...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="⚙️ Settings" pageSubtitle="Manage platform configurations, KYC, email and notifications">
      <div style={headerCard}>
        <div>
          <p style={headerText}>
            Changes here affect the live platform — review before saving.
          </p>
        </div>

        <button style={{ ...saveButton, ...(saving ? saveButtonDisabled : {}) }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      </div>

      {message && <div style={messageBox}>{message}</div>}

      {/* GENERAL SETTINGS */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>🏢 General Settings</h2>

        <div style={grid}>
          <div>
            <label style={label}>Company Name</label>
            <input
              style={input}
              value={settings.general.companyName}
              onChange={(e) =>
                setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })
              }
            />
          </div>

          <div>
            <label style={label}>Support Email</label>
            <input
              style={input}
              value={settings.general.supportEmail}
              onChange={(e) =>
                setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })
              }
            />
          </div>

          <div>
            <label style={label}>Contact Number</label>
            <input
              style={input}
              value={settings.general.contactNumber}
              onChange={(e) =>
                setSettings({ ...settings, general: { ...settings.general, contactNumber: e.target.value } })
              }
            />
          </div>
        </div>
      </div>

      {/* EMAIL SETTINGS */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>📧 Email Settings</h2>

        <div style={grid}>
          <div>
            <label style={label}>SMTP Host</label>
            <input
              style={input}
              value={settings.email.smtpHost}
              onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpHost: e.target.value } })}
            />
          </div>

          <div>
            <label style={label}>SMTP Port</label>
            <input
              style={input}
              value={settings.email.smtpPort}
              onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpPort: e.target.value } })}
            />
          </div>

          <div>
            <label style={label}>SMTP Username</label>
            <input
              style={input}
              value={settings.email.smtpUser}
              onChange={(e) => setSettings({ ...settings, email: { ...settings.email, smtpUser: e.target.value } })}
            />
          </div>

          <div>
            <label style={label}>SMTP Password</label>
            <input
              type="password"
              style={input}
              value={settings.email.smtpPassword}
              onChange={(e) =>
                setSettings({ ...settings, email: { ...settings.email, smtpPassword: e.target.value } })
              }
            />
          </div>
        </div>
      </div>

      {/* KYC SETTINGS */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>🧾 KYC Settings</h2>

        <div style={grid}>
          <div>
            <label style={label}>Provider</label>
            <input
              style={{ ...input, background: "#f3f4f6" }}
              value={settings.kyc.provider}
              readOnly
              title="Set by your Sandbox.co.in integration — not editable here."
            />
          </div>

          <div>
            <label style={label}>Verification Limit</label>
            <input
              style={input}
              type="number"
              value={settings.kyc.verificationLimit}
              onChange={(e) => setSettings({ ...settings, kyc: { ...settings.kyc, verificationLimit: e.target.value } })}
            />
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={settings.kyc.enabled}
              onChange={(e) => setSettings({ ...settings, kyc: { ...settings.kyc, enabled: e.target.checked } })}
            />
            Enable KYC Verification
          </label>
        </div>
      </div>

      {/* NOTIFICATION SETTINGS */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>🔔 Notification Settings</h2>

        <div style={checkboxGroup}>
          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, emailNotifications: e.target.checked },
                })
              }
            />
            Email Notifications
          </label>

          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, smsNotifications: e.target.checked },
                })
              }
            />
            SMS Notifications
          </label>

          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, pushNotifications: e.target.checked },
                })
              }
            />
            Push Notifications
          </label>
        </div>
      </div>
    </AdminShell>
  );
}

const loadingStyle = { padding: "60px", textAlign: "center", color: "#6b7280" };

const headerCard = {
  background: "linear-gradient(135deg,#667eea,#764ba2)",
  color: "#fff",
  padding: "22px 25px",
  borderRadius: "16px",
  marginBottom: "22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "14px",
};

const headerText = { margin: 0, fontSize: "13.5px", opacity: 0.9 };

const saveButton = {
  background: "#fff",
  color: "#667eea",
  border: "none",
  padding: "12px 22px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const saveButtonDisabled = { opacity: 0.6, cursor: "not-allowed" };

const messageBox = {
  background: "#fff",
  padding: "14px 16px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  fontSize: "14px",
};

const sectionCard = {
  background: "#fff",
  padding: "24px",
  borderRadius: "16px",
  marginBottom: "20px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
};

const sectionTitle = { marginTop: 0, marginBottom: "20px", fontSize: "16px" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: "18px",
};

const label = { display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px", color: "#374151" };

const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #d9dee6",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const checkboxGroup = { display: "flex", gap: "30px", flexWrap: "wrap" };

const checkLabel = { display: "flex", gap: "10px", alignItems: "center", fontWeight: "600", fontSize: "14px" };