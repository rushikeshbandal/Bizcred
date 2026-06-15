"use client";

import { useEffect, useState } from "react";

export default function Settings() {
  const [settings, setSettings] =
    useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const token =
      localStorage.getItem("token");

    const res = await fetch(
      "/api/admin/settings",
      {
        headers: {
          Authorization:
            "Bearer " + token,
        },
      }
    );

    const data = await res.json();

    setSettings(data.settings);
  };

  const saveSettings = async () => {
    const token =
      localStorage.getItem("token");

    const res = await fetch(
      "/api/admin/settings",
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            "Bearer " + token,
        },

        body: JSON.stringify(settings),
      }
    );

    const data = await res.json();

    alert(data.message);
  };

  if (!settings)
    return <h2>Loading...</h2>;

  return (
    <div
      style={{
        padding: "30px",
      }}
    >
      <h1>⚙️ Settings</h1>

      <div style={card}>
        <h2>General Settings</h2>

        <input
          placeholder="Company Name"
          value={
            settings.general.companyName
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

        <input
          placeholder="Support Email"
          value={
            settings.general.supportEmail
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

        <input
          placeholder="Support Phone"
          value={
            settings.general.supportPhone
          }
          onChange={(e) =>
            setSettings({
              ...settings,
              general: {
                ...settings.general,
                supportPhone:
                  e.target.value,
              },
            })
          }
        />
      </div>

      <div style={card}>
        <h2>KYC Settings</h2>

        <label>
          Enable KYC
        </label>

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
        />
      </div>

      <button
        onClick={saveSettings}
        style={btn}
      >
        Save Settings
      </button>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "15px",
};

const btn = {
  background: "#667eea",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};