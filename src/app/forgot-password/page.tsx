"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") === "student" ? "student" : "driver";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const { error: otpError } =
        await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: false,
          },
        });

      if (otpError) {
        console.error("OTP request error:", otpError);

        setError(
          "Unable to send the verification code. Please try again later."
        );
        return;
      }

      sessionStorage.setItem(
        "aju_reset_email",
        cleanEmail
      );

      sessionStorage.setItem(
        "aju_reset_role",
        role
      );

      setMessage(
        "If an account exists for this email, a 6-digit verification code has been sent."
      );

      setTimeout(() => {
        router.push(
          `/verify-otp?role=${role}`
        );
      }, 1200);
    } catch (err) {
      console.error(
        "Unexpected OTP request error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-5 py-10">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-2xl sm:p-9">

          {/* Logo */}
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl shadow-sm">
              🔐
            </div>

            <p className="mt-5 text-xs font-black tracking-[0.25em] text-[#005BAC]">
              AJU SMART BUS
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter your registered email and
              we will send you a verification code.
            </p>
          </div>

          {/* Success */}
          {message && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-bold text-green-700">
                {message}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-bold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm font-black text-slate-700"
              >
                Registered Email
              </label>

              <input
                id="reset-email"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#005BAC] px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending Code..."
                : "Send Verification Code"}
            </button>
          </form>

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              router.push(
                role === "student"
                  ? "/student/login"
                  : "/driver/login"
              )
            }
            disabled={loading}
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            ← Back to Login
          </button>
        </div>

        <p className="mt-5 text-center text-xs font-semibold text-slate-400">
          Arka Jain University • AJU Smart Bus
          Tracking System
        </p>
      </div>
    </main>
  );
}