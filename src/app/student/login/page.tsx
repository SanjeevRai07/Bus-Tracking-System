"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function StudentLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          router.replace("/student/dashboard");
          return;
        }
      } catch (err) {
        console.error("Student session check error:", err);
      }

      if (mounted) {
        setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (loginError) {
        console.error(
          "Student login error:",
          loginError
        );

        setError(
          loginError.message ||
            "Invalid email or password."
        );

        return;
      }

      if (!data.user) {
        setError(
          "Login failed. Please try again."
        );

        return;
      }

      router.replace(
        "/student/dashboard"
      );
    } catch (err) {
      console.error(
        "Unexpected student login error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#005BAC] text-3xl shadow-lg">
            🚌
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Checking session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#005BAC] text-4xl shadow-xl">
            🎓
          </div>

          <h1 className="mt-5 text-3xl font-black text-[#005BAC]">
            Student Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Login to track your university bus
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="student-email"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                University Email
              </label>

              <input
                id="student-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="student@aju.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="student-password"
                  className="block text-sm font-bold text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/forgot-password?role=student"
                    )
                  }
                  disabled={loading}
                  className="text-xs font-black text-[#005BAC] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              </div>

              <input
                id="student-password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter password"
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#005BAC] py-3.5 font-black text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>
          </form>

          {/* Back */}
          <button
            type="button"
            onClick={() => router.push("/")}
            disabled={loading}
            className="mt-6 w-full text-sm font-semibold text-slate-500 transition hover:text-[#005BAC] disabled:opacity-50"
          >
            ← Back to Home
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          AJU Smart Bus Tracking System
        </p>
      </div>
    </main>
  );
}