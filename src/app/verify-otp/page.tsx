"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyOtp() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role =
    searchParams.get("role") === "student"
      ? "student"
      : "driver";

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem(
      "aju_reset_email"
    );

    if (!savedEmail) {
      router.replace(
        `/forgot-password?role=${role}`
      );
      return;
    }

    setEmail(savedEmail);
  }, [router, role]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  function handleOtpChange(
    value: string
  ) {
    const numbersOnly = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(numbersOnly);
    setError("");
  }

  async function handleVerify(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Your recovery session has expired. Please start again."
      );
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setLoading(true);

    try {
      const { data, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: "email",
        });

      if (verifyError) {
        console.error(
          "OTP verification error:",
          verifyError
        );

        setError(
          "Invalid or expired verification code. Please try again."
        );
        return;
      }

      if (!data.session || !data.user) {
        setError(
          "Verification failed. Please request a new code."
        );
        return;
      }

      sessionStorage.setItem(
        "aju_password_reset_verified",
        "true"
      );

      sessionStorage.setItem(
        "aju_reset_email",
        email
      );

      sessionStorage.setItem(
        "aju_reset_role",
        role
      );

      router.replace(
        `/reset-password?role=${role}`
      );
    } catch (err) {
      console.error(
        "Unexpected OTP verification error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || cooldown > 0 || resending) {
      return;
    }

    setError("");
    setMessage("");
    setResending(true);

    try {
      const { error: resendError } =
        await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
          },
        });

      if (resendError) {
        console.error(
          "OTP resend error:",
          resendError
        );

        setError(
          "Unable to resend the code right now. Please try again later."
        );
        return;
      }

      setOtp("");
      setCooldown(60);

      setMessage(
        "If an account exists for this email, a new verification code has been sent."
      );
    } catch (err) {
      console.error(
        "Unexpected OTP resend error:",
        err
      );

      setError(
        "Something went wrong while resending the code."
      );
    } finally {
      setResending(false);
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
              Verify Code
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the 6-digit verification code
              sent to your registered email.
            </p>

            {email && (
              <p className="mt-3 break-all text-sm font-bold text-[#005BAC]">
                {email}
              </p>
            )}
          </div>

          {/* Message */}
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

          {/* OTP Form */}
          <form
            onSubmit={handleVerify}
            className="mt-7 space-y-5"
          >
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-black text-slate-700"
              >
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) =>
                  handleOtpChange(
                    event.target.value
                  )
                }
                placeholder="Enter 6-digit code"
                maxLength={6}
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-black tracking-[0.45em] text-slate-800 outline-none transition focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                otp.length !== 6
              }
              className="w-full rounded-2xl bg-[#005BAC] px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify Code"}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={
                cooldown > 0 ||
                resending ||
                loading
              }
              className="mt-2 text-sm font-black text-[#005BAC] transition hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {resending
                ? "Sending..."
                : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend verification code"}
            </button>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() =>
              router.push(
                `/forgot-password?role=${role}`
              )
            }
            disabled={loading || resending}
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            ← Change Email
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