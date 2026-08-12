"use client";

import { useEffect, useState } from "react";

interface Settings {
  pushNotifications: boolean;
  emailAlerts: boolean;
  busAlerts: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  pushNotifications: true,
  emailAlerts: true,
  busAlerts: true,
};

export default function AdminSettings() {
  const [settings, setSettings] =
    useState<Settings>(DEFAULT_SETTINGS);

  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  /* ================================
     LOAD SAVED SETTINGS
  ================================= */

  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "aju-smart-bus-settings"
    );

    if (savedSettings) {
      try {
        const data = JSON.parse(savedSettings);

        setSettings({
          pushNotifications:
            data.pushNotifications ?? true,
          emailAlerts:
            data.emailAlerts ?? true,
          busAlerts:
            data.busAlerts ?? true,
        });
      } catch {
        console.log("Could not load settings");
      }
    }
  }, []);

  /* ================================
     TOGGLE
  ================================= */

  const toggleSetting = (
    key: keyof Settings
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  /* ================================
     SAVE
  ================================= */

  const saveSettings = () => {
    localStorage.setItem(
      "aju-smart-bus-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* ================================
     RESET
  ================================= */

  const resetSettings = () => {
    const confirmReset = window.confirm(
      "Reset all settings?"
    );

    if (!confirmReset) return;

    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      "aju-smart-bus-settings",
      JSON.stringify(DEFAULT_SETTINGS)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* ================================
     PASSWORD
  ================================= */

  const changePassword = () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(
        "New password and confirm password do not match."
      );
      return;
    }

    alert(
      "Password validation successful. Supabase Auth can be connected here."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  /* ================================
     TOGGLE COMPONENT
  ================================= */

  const Toggle = ({
    enabled,
    onClick,
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${
          enabled
            ? "bg-green-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            enabled
              ? "left-7"
              : "left-1"
          }`}
        />
      </button>
    );
  };

  return (
    <main className="min-h-screen w-full bg-slate-100 px-8 py-8">

      <div className="w-full">

        {/* ================================
            HEADER
        ================================= */}

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-[#005BAC]">
            Settings
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            Manage your AJU Smart Bus administrator
            settings and preferences.
          </p>

        </div>

        {/* ================================
            SUCCESS
        ================================= */}

        {saved && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 font-bold text-white">
              ✓
            </div>

            <div>
              <p className="font-semibold text-green-700">
                Settings saved successfully
              </p>

              <p className="text-sm text-green-600">
                Your preferences have been saved.
              </p>
            </div>

          </div>
        )}

        {/* ================================
            SETTINGS CARDS
        ================================= */}

        <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-2">

          {/* ==============================
              NOTIFICATIONS
          =============================== */}

          <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <h2 className="text-2xl font-bold text-[#005BAC]">
              Notification Settings
            </h2>

            <p className="mt-2 mb-6 text-slate-500">
              Control how you receive important
              bus management notifications.
            </p>

            {/* PUSH */}

            <div className="mb-4 flex min-h-[90px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                  🔔
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    Push Notifications
                  </h3>

                  <p className="text-sm text-slate-500">
                    Receive important notifications
                  </p>
                </div>

              </div>

              <Toggle
                enabled={settings.pushNotifications}
                onClick={() =>
                  toggleSetting(
                    "pushNotifications"
                  )
                }
              />

            </div>

            {/* EMAIL */}

            <div className="mb-4 flex min-h-[90px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  📧
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    Email Alerts
                  </h3>

                  <p className="text-sm text-slate-500">
                    Receive alerts through email
                  </p>
                </div>

              </div>

              <Toggle
                enabled={settings.emailAlerts}
                onClick={() =>
                  toggleSetting(
                    "emailAlerts"
                  )
                }
              />

            </div>

            {/* BUS ALERTS */}

            <div className="flex min-h-[90px] items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  🚌
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800">
                    Bus Alerts
                  </h3>

                  <p className="text-sm text-slate-500">
                    Get alerts about bus status
                  </p>
                </div>

              </div>

              <Toggle
                enabled={settings.busAlerts}
                onClick={() =>
                  toggleSetting(
                    "busAlerts"
                  )
                }
              />

            </div>

          </section>

          {/* ==============================
              SECURITY
          =============================== */}

          <section className="w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <h2 className="text-2xl font-bold text-[#005BAC]">
              Account Security
            </h2>

            <p className="mt-2 mb-6 text-slate-500">
              Manage your administrator account
              security.
            </p>

            {/* CURRENT */}

            <label className="mb-2 block font-semibold text-slate-700">
              Current Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
              placeholder="Enter current password"
              className="mb-5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
            />

            {/* NEW */}

            <label className="mb-2 block font-semibold text-slate-700">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="mb-5 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
            />

            {/* CONFIRM */}

            <label className="mb-2 block font-semibold text-slate-700">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="mb-6 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={changePassword}
              className="w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Change Password
            </button>

            <div className="mt-4 rounded-xl bg-blue-50 p-4">

              <p className="text-sm text-blue-700">
                <strong>Note:</strong>{" "}
                Password authentication can be
                connected to Supabase Auth.
              </p>

            </div>

          </section>

        </div>

        {/* ================================
            SYSTEM INFORMATION
        ================================= */}

        <section className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-2xl font-bold text-[#005BAC]">
            System Information
          </h2>

          <p className="mt-2 text-slate-500">
            Information about your AJU Smart Bus
            administration system.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Application
              </p>

              <p className="mt-2 text-lg font-bold text-slate-800">
                AJU Smart Bus
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                Panel
              </p>

              <p className="mt-2 text-lg font-bold text-slate-800">
                Administrator
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-sm text-slate-500">
                System Status
              </p>

              <p className="mt-2 flex items-center gap-2 text-lg font-bold text-green-600">

                <span className="h-3 w-3 rounded-full bg-green-500" />

                Online

              </p>

            </div>

          </div>

        </section>

        {/* ================================
            ACTION BUTTONS
        ================================= */}

        <div className="flex w-full justify-end gap-4 py-8">

          <button
            type="button"
            onClick={resetSettings}
            className="rounded-xl border border-red-200 bg-white px-8 py-3 font-semibold text-red-600 hover:bg-red-50"
          >
            Reset Settings
          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="rounded-xl bg-[#005BAC] px-8 py-3 font-semibold text-white shadow-md hover:bg-blue-700"
          >
            💾 Save Settings
          </button>

        </div>

      </div>

    </main>
  );
}