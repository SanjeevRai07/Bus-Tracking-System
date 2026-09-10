"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DriverLogin() {
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
          router.replace("/driver/dashboard");
          return;
        }
      } catch (err) {
        console.error("Driver session check error:", err);
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

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginError) {
        console.error("Driver login error:", loginError);

        setError(
          loginError.message || "Invalid email or password."
        );

        return;
      }

      if (!data.user) {
        setError("Login failed. Please try again.");
        return;
      }

      router.replace("/driver/dashboard");
    } catch (err) {
      console.error("Unexpected driver login error:", err);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm">
            🚌
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Checking driver session...
          </p>

          <div className="mx-auto mt-5 h-2 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#005BAC]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-5 py-10">
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      {/* LOGIN CARD */}
      <div className="relative w-full max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">

          {/* LOGO */}
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl shadow-sm">
              🚌
            </div>

            <p className="mt-5 text-xs font-black tracking-[0.25em] text-[#005BAC]">
              AJU SMART BUS
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Driver Login
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to access your assigned bus
              and start live GPS tracking.
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-7 space-y-5"
          >

            {/* EMAIL */}
            <div>
              <label
                htmlFor="driver-email"
                className="mb-2 block text-sm font-black text-slate-700"
              >
                Email Address
              </label>

              <input
                id="driver-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="driver-password"
                  className="block text-sm font-black text-slate-700"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/forgot-password?role=driver"
                    )
                  }
                  disabled={loading}
                  className="text-xs font-black text-[#005BAC] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              </div>

              <input
                id="driver-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* LOGIN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#005BAC] px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Signing in..."
                : "Login as Driver"}
            </button>
          </form>

          {/* INFO */}
          <div className="mt-6 rounded-2xl bg-blue-50 p-4">
            <div className="flex gap-3">
              <div className="text-lg">
                ℹ️
              </div>

              <div>
                <p className="text-xs font-black text-[#005BAC]">
                  Driver Access
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  After login, your assigned bus
                  and route will be loaded from
                  the Admin panel.
                </p>
              </div>
            </div>
          </div>

          {/* BACK HOME */}
          <button
            type="button"
            onClick={() => router.push("/")}
            disabled={loading}
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            ← Back to Home
          </button>
        </div>

        {/* FOOTER */}
        <p className="mt-5 text-center text-xs font-semibold text-slate-400">
          Arka Jain University • AJU Smart
          Bus Tracking System
        </p>
      </div>
    </main>
  );
}