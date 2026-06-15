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

       <div>
         <label>Company Name</label>
           <input
               style={input}
               placeholder="Company Name"
           />
        </div>
         <div>
         <label>Support Email</label>
           <input
               style={input}
               placeholder="Support Email"
           />
        </div>

       

        <div>
         <label>Support Phone</label>
           <input
               style={input}
               placeholder="Support Phone"
           />
        </div>
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
  padding: "25px",
  borderRadius: "20px",
  marginBottom: "25px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
};
const btn = {
  background: "#667eea",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
};
const input = {
  width: "100%",
  padding: "12px 15px",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  fontSize: "14px",
  outline: "none",
  marginTop: "8px",
};

const sectionTitle = {
  marginBottom: "20px",
  color: "#111827",
};

const row = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
  gap: "20px",
};

const h1 = {
  marginTop :"100px" ,
  padding : "100px"
};