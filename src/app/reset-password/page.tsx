"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role =
    searchParams.get("role") === "student"
      ? "student"
      : "driver";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkVerification() {
      const verified =
        sessionStorage.getItem(
          "aju_password_reset_verified"
        );

      if (verified !== "true") {
        router.replace(
          `/forgot-password?role=${role}`
        );
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        sessionStorage.removeItem(
          "aju_password_reset_verified"
        );

        router.replace(
          `/forgot-password?role=${role}`
        );
        return;
      }

      setChecking(false);
    }

    checkVerification();
  }, [router, role]);

  function validatePassword(value: string) {
    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain a lowercase letter.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain an uppercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain a number.";
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Password must contain a special character.";
    }

    return "";
  }

  async function handleReset(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        console.error(
          "Password update error:",
          updateError
        );

        setError(
          "Unable to update your password. Please try again."
        );
        return;
      }

      /*
       * Clear the temporary recovery state.
       */
      sessionStorage.removeItem(
        "aju_password_reset_verified"
      );

      sessionStorage.removeItem(
        "aju_reset_email"
      );

      sessionStorage.removeItem(
        "aju_reset_role"
      );

      /*
       * Sign out after changing the password.
       * The user must log in again using the new password.
       */
      await supabase.auth.signOut();

      router.replace(
        role === "student"
          ? "/student/login?reset=success"
          : "/driver/login?reset=success"
      );
    } catch (err) {
      console.error(
        "Unexpected password reset error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            🔐
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Verifying recovery session...
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
              🔑
            </div>

            <p className="mt-5 text-xs font-black tracking-[0.25em] text-[#005BAC]">
              AJU SMART BUS
            </p>

            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Create New Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your verification code has been
              confirmed. Create a new secure
              password for your account.
            </p>
          </div>

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
            onSubmit={handleReset}
            className="mt-7 space-y-5"
          >
            {/* New Password */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-black text-slate-700"
              >
                New Password
              </label>

              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-black text-slate-700"
              >
                Confirm New Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="Confirm new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password Requirements */}
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="text-xs font-black text-[#005BAC]">
                Password requirements
              </p>

              <ul className="mt-2 space-y-1 text-xs font-semibold text-slate-500">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
                <li>• One special character</li>
              </ul>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !password ||
                !confirmPassword
              }
              className="w-full rounded-2xl bg-[#005BAC] px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex gap-3">
              <div className="text-lg">
                🛡️
              </div>

              <div>
                <p className="text-xs font-black text-slate-700">
                  Secure Password Recovery
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  After changing your password,
                  you will need to log in again
                  using your new password.
                </p>
              </div>
            </div>
          </div>

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