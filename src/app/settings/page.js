"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);

  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();

    setSettings(data.settings);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    const data = await res.json();

    alert(data.message);
  };

  if (!settings) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Settings</h1>

      <hr />

      <h2>General Settings</h2>
     
      <input
        placeholder="Company Name"
        value={settings.general.companyName}
        onChange={(e) =>
          setSettings({
            ...settings,
            general: {
              ...settings.general,
              companyName: e.target.value,
            },
          })
        }
      />
    
      <br /><br />

      <input
        placeholder="Support Email"
        value={settings.general.supportEmail}
        onChange={(e) =>
          setSettings({
            ...settings,
            general: {
              ...settings.general,
              supportEmail: e.target.value,
            },
          })
        }
      />

      <br /><br />

      <input
        placeholder="Contact Number"
        value={settings.general.contactNumber}
        onChange={(e) =>
          setSettings({
            ...settings,
            general: {
              ...settings.general,
              contactNumber: e.target.value,
            },
          })
        }
      />

      <hr />

      <h2>Email Settings</h2>

      <input
        placeholder="SMTP Host"
        value={settings.email.smtpHost}
        onChange={(e) =>
          setSettings({
            ...settings,
            email: {
              ...settings.email,
              smtpHost: e.target.value,
            },
          })
        }
      />

      <br /><br />

      <input
        placeholder="SMTP Port"
        value={settings.email.smtpPort}
        onChange={(e) =>
          setSettings({
            ...settings,
            email: {
              ...settings.email,
              smtpPort: e.target.value,
            },
          })
        }
      />

      <hr />

      <h2>KYC Settings</h2>

      <label>
        Enable KYC
        <input
          type="checkbox"
          checked={settings.kyc.enabled}
          onChange={(e) =>
            setSettings({
              ...settings,
              kyc: {
                ...settings.kyc,
                enabled: e.target.checked,
              },
            })
          }
        />
      </label>

      <br /><br />

      <input
        placeholder="Provider"
        value={settings.kyc.provider}
        onChange={(e) =>
          setSettings({
            ...settings,
            kyc: {
              ...settings.kyc,
              provider: e.target.value,
            },
          })
        }
      />

      <br /><br />

      <input
        placeholder="Verification Limit"
        value={settings.kyc.verificationLimit}
        onChange={(e) =>
          setSettings({
            ...settings,
            kyc: {
              ...settings.kyc,
              verificationLimit: e.target.value,
            },
          })
        }
      />

      <hr />

      <h2>Notification Settings</h2>

      <label>
        Email Notifications
        <input
          type="checkbox"
          checked={settings.notifications.emailNotifications}
          onChange={(e) =>
            setSettings({
              ...settings,
              notifications: {
                ...settings.notifications,
                emailNotifications: e.target.checked,
              },
            })
          }
        />
      </label>

      <br /><br />

      <label>
        SMS Notifications
        <input
          type="checkbox"
          checked={settings.notifications.smsNotifications}
          onChange={(e) =>
            setSettings({
              ...settings,
              notifications: {
                ...settings.notifications,
                smsNotifications: e.target.checked,
              },
            })
          }
        />
      </label>

      <br /><br />

      <label>
        Push Notifications
        <input
          type="checkbox"
          checked={settings.notifications.pushNotifications}
          onChange={(e) =>
            setSettings({
              ...settings,
              notifications: {
                ...settings.notifications,
                pushNotifications: e.target.checked,
              },
            })
          }
        />
      </label>

      <br /><br />

      <button onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
}