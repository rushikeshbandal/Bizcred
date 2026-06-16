"use client";

import { useEffect, useState } from "react";

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
      provider: "Didit",
      verificationLimit: 5,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
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
    try {
      setMessage("");

      if (
        !settings.general.companyName ||
        !settings.general.supportEmail
      ) {
        setMessage(
          "Please fill required fields."
        );
        return;
      }

      const res = await fetch(
        "/api/admin/settings",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage(
          "✅ Settings saved successfully"
        );
      } else {
        setMessage(
          "❌ Failed to save settings"
        );
      }
    } catch (error) {
      console.log(error);

      setMessage(
        "❌ Something went wrong"
      );
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading Settings...
      </div>
    );
  }

  return (
    <div style={container}>
      {/* HEADER */}

      <div style={headerCard}>
        <div>
          <h1 style={heading}>
            ⚙️ Settings
          </h1>

          <p style={subHeading}>
            Manage platform
            configurations, KYC,
            email and notifications
          </p>
        </div>

        <button
          style={saveButton}
          onClick={handleSave}
        >
          💾 Save Changes
        </button>
      </div>

      {message && (
        <div style={messageBox}>
          {message}
        </div>
      )}

      {/* GENERAL SETTINGS */}

      <div style={sectionCard}>
        <h2 style={sectionTitle}>
          🏢 General Settings
        </h2>

        <div style={grid}>
          <div>
            <label style={label}>
              Company Name
            </label>

            <input
              style={input}
              value={
                settings.general
                  .companyName
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: {
                    ...settings.general,
                    companyName:
                      e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label style={label}>
              Support Email
            </label>

            <input
              style={input}
              value={
                settings.general
                  .supportEmail
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: {
                    ...settings.general,
                    supportEmail:
                      e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label style={label}>
              Contact Number
            </label>

            <input
              style={input}
              value={
                settings.general
                  .contactNumber
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: {
                    ...settings.general,
                    contactNumber:
                      e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* EMAIL SETTINGS */}

      <div style={sectionCard}>
        <h2 style={sectionTitle}>
          📧 Email Settings
        </h2>

        <div style={grid}>
          <div>
            <label style={label}>
              SMTP Host
            </label>

            <input
              style={input}
              value={
                settings.email.smtpHost
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpHost:
                      e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label style={label}>
              SMTP Port
            </label>

            <input
              style={input}
              value={
                settings.email.smtpPort
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpPort:
                      e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label style={label}>
              SMTP Username
            </label>

            <input
              style={input}
              value={
                settings.email.smtpUser
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpUser:
                      e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label style={label}>
              SMTP Password
            </label>

            <input
              type="password"
              style={input}
              value={
                settings.email
                  .smtpPassword
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    smtpPassword:
                      e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* KYC SETTINGS */}

      <div style={sectionCard}>
        <h2 style={sectionTitle}>
          🧾 KYC Settings
        </h2>

        <div style={grid}>
          <div>
            <label style={label}>
              Provider
            </label>

            <input
              style={input}
              value={
                settings.kyc.provider
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  kyc: {
                    ...settings.kyc,
                    provider:
                      e.target.value,
                  },
                })
              }
            />
          </div>

          <div>
            <label style={label}>
              Verification Limit
            </label>

            <input
              style={input}
              value={
                settings.kyc
                  .verificationLimit
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  kyc: {
                    ...settings.kyc,
                    verificationLimit:
                      e.target.value,
                  },
                })
              }
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <label
            style={{
              fontWeight: "600",
            }}
          >
            <input
              type="checkbox"
              checked={
                settings.kyc.enabled
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  kyc: {
                    ...settings.kyc,
                    enabled:
                      e.target.checked,
                  },
                })
              }
              style={{
                marginRight: "10px",
              }}
            />
            Enable KYC Verification
          </label>
        </div>
      </div>

      {/* NOTIFICATION SETTINGS */}

      <div style={sectionCard}>
        <h2 style={sectionTitle}>
          🔔 Notification Settings
        </h2>

        <div style={checkboxGroup}>
          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={
                settings.notifications
                  .emailNotifications
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    emailNotifications:
                      e.target.checked,
                  },
                })
              }
            />
            Email Notifications
          </label>

          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={
                settings.notifications
                  .smsNotifications
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    smsNotifications:
                      e.target.checked,
                  },
                })
              }
            />
            SMS Notifications
          </label>

          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={
                settings.notifications
                  .pushNotifications
              }
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    pushNotifications:
                      e.target.checked,
                  },
                })
              }
            />
            Push Notifications
          </label>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const container = {
  padding: "30px",
  background: "#f4f7fe",
  minHeight: "100vh",
};

const loadingStyle = {
  padding: "40px",
  textAlign: "center",
};

const headerCard = {
  background:
    "linear-gradient(135deg,#667eea,#764ba2)",
  color: "#fff",
  padding: "25px",
  borderRadius: "20px",
  marginBottom: "25px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
};

const heading = {
  margin: 0,
};

const subHeading = {
  marginTop: "8px",
  opacity: 0.85,
};

const saveButton = {
  background: "#fff",
  color: "#667eea",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const messageBox = {
  background: "#fff",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.05)",
};

const sectionCard = {
  background: "#fff",
  padding: "25px",
  borderRadius: "20px",
  marginBottom: "25px",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.05)",
};

const sectionTitle = {
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(300px,1fr))",
  gap: "20px",
};

const label = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
};

const input = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  outline: "none",
};

const checkboxGroup = {
  display: "flex",
  gap: "30px",
  flexWrap: "wrap",
};

const checkLabel = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  fontWeight: "600",
};