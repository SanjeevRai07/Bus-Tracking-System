"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    router.replace("/admin/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md">

        {/* LOGO / TITLE */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#005BAC] text-3xl shadow-lg">
            🚌
          </div>

          <h1 className="text-3xl font-bold text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-slate-500">
            Administrator Login
          </p>

        </div>

        {/* LOGIN CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-800">
              Admin Login
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage the AJU Smart Bus system.
            </p>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Admin Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter admin email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#005BAC] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Login as Admin"}
            </button>

          </form>

          {/* ADMIN INFO */}

          <div className="mt-6 rounded-xl bg-blue-50 p-4">

            <p className="text-sm font-semibold text-[#005BAC]">
              Administrator Access
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Authorized administrators can manage
              buses, drivers, routes, students and
              live GPS tracking.
            </p>

          </div>

        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          AJU Smart Bus Tracking System
        </p>

      </div>

    </main>
  );
}