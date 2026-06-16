"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch("/api/admin/settings");
    const data = await res.json();
    setSettings(data.settings);
  };

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

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-500">
            Manage system configurations
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Save Changes
        </button>
      </div>

      {/* Tabs */}

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "general"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          General
        </button>

        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "email"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Email
        </button>

        <button
          onClick={() => setActiveTab("kyc")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "kyc"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          KYC
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "notifications"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Content Card */}

      <div className="bg-white rounded-xl shadow-md p-6">

        {activeTab === "general" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              General Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block mb-2 font-medium">
                  Company Name
                </label>

                <input
                  className="w-full border rounded-lg p-3"
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
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Support Email
                </label>

                <input
                  className="w-full border rounded-lg p-3"
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
              </div>

            </div>
          </>
        )}

        {activeTab === "email" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Email Settings
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                className="border rounded-lg p-3"
                placeholder="SMTP Host"
                value={settings.email.smtpHost}
              />

              <input
                className="border rounded-lg p-3"
                placeholder="SMTP Port"
                value={settings.email.smtpPort}
              />

            </div>
          </>
        )}

        {activeTab === "kyc" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              KYC Settings
            </h2>

            <div className="space-y-4">

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.kyc.enabled}
                />
                Enable KYC Verification
              </label>

              <input
                className="border rounded-lg p-3 w-full"
                placeholder="Provider"
                value={settings.kyc.provider}
              />
            </div>
          </>
        )}

        {activeTab === "notifications" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Notification Settings
            </h2>

            <div className="space-y-4">

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    settings.notifications.emailNotifications
                  }
                />
                Email Notifications
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    settings.notifications.smsNotifications
                  }
                />
                SMS Notifications
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    settings.notifications.pushNotifications
                  }
                />
                Push Notifications
              </label>

            </div>
          </>
        )}

      </div>
    </div>
  );
}