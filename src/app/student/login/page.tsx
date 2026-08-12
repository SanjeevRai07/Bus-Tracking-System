"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StudentLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed.");
      setLoading(false);
      return;
    }

    router.replace("/student/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 flex items-center justify-center">

      <div className="w-full max-w-md">

        {/* ICON */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#005BAC] text-4xl shadow-lg">
            🎓
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#005BAC]">
            Student Login
          </h1>

          <p className="mt-2 text-slate-500">
            Track your university bus in real time
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                University Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@aju.com"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#005BAC] py-3.5 font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 w-full text-sm font-medium text-slate-500 hover:text-[#005BAC]"
          >
            ← Back to Home
          </button>

        </div>

      </div>

    </main>
  );
}