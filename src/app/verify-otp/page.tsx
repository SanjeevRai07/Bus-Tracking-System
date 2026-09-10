"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserRole = "student" | "driver";

export default function VerifyOtpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    function loadResetInformation() {
      const savedEmail =
        sessionStorage.getItem("aju_reset_email");

      const savedRole =
        sessionStorage.getItem("aju_reset_role");

      if (!savedEmail) {
        router.replace("/forgot-password");
        return;
      }

      const resolvedRole: UserRole =
        savedRole === "driver"
          ? "driver"
          : "student";

      if (mounted) {
        setEmail(savedEmail);
        setRole(resolvedRole);
        setChecking(false);
      }
    }

    loadResetInformation();

    return () => {
      mounted = false;
    };
  }, [router]);

  function handleOtpChange(
    value: string
  ) {
    const digitsOnly = value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(digitsOnly);
    setError("");
    setMessage("");
  }

  async function handleVerifyOtp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanOtp = otp.trim();

    if (!email) {
      setError(
        "Reset email was not found. Please request a new verification code."
      );
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
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
          token: cleanOtp,
          type: "email",
        });

      if (verifyError) {
        throw verifyError;
      }

      if (!data.session) {
        throw new Error(
          "Verification completed but no reset session was created. Please request a new code."
        );
      }

      sessionStorage.setItem(
        "aju_password_reset_verified",
        "true"
      );

      setMessage(
        "Code verified successfully. Redirecting..."
      );

      setTimeout(() => {
        router.replace(
          "/reset-password"
        );
      }, 700);
    } catch (err) {
      console.error(
        "OTP verification error:",
        err
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to verify the code.";

      const normalized =
        errorMessage.toLowerCase();

      if (
        normalized.includes("expired") ||
        normalized.includes("otp_expired")
      ) {
        setError(
          "This verification code has expired. Please request a new code."
        );
      } else if (
        normalized.includes("invalid") ||
        normalized.includes("token")
      ) {
        setError(
          "The verification code is invalid. Please check the code and try again."
        );
      } else if (
        normalized.includes("rate limit")
      ) {
        setError(
          "Too many verification attempts. Please wait and try again."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setMessage("");

    if (!email) {
      setError(
        "Reset email was not found. Please start the password recovery process again."
      );
      return;
    }

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
        throw resendError;
      }

      setOtp("");

      setMessage(
        "A new 6-digit verification code has been sent to your email."
      );
    } catch (err) {
      console.error(
        "OTP resend error:",
        err
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to resend the verification code.";

      if (
        errorMessage
          .toLowerCase()
          .includes("rate limit")
      ) {
        setError(
          "Too many OTP requests. Please wait a few minutes before requesting another code."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setResending(false);
    }
  }

  function handleBack() {
    router.push(
      `/forgot-password?role=${role}`
    );
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 px-5">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            🔐
          </div>

          <h1 className="mt-5 text-xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Preparing verification...
          </p>

          <div className="mx-auto mt-6 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#005BAC]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
          {/* LEFT PANEL */}
          <section className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-[#004A91] via-[#005BAC] to-[#0074D9] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur">
                  🚌
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-blue-100">
                    AJU SMART BUS
                  </p>

                  <h1 className="mt-1 text-xl font-black">
                    Email Verification
                  </h1>
                </div>
              </div>

              <div className="mt-28">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                  Secure Verification
                </p>

                <h2 className="mt-5 max-w-lg text-4xl font-black leading-tight">
                  Verify your identity before changing your password.
                </h2>

                <p className="mt-6 max-w-lg text-base leading-8 text-blue-100">
                  We sent a six-digit verification code to your
                  registered email address. Enter it here to
                  continue to password recovery.
                </p>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  📧
                </div>

                <div>
                  <p className="font-bold">
                    Check your email
                  </p>

                  <p className="mt-1 text-xs leading-6 text-blue-100">
                    The verification code is valid only for a limited
                    period.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT PANEL */}
          <section className="flex min-h-[650px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              {/* MOBILE HEADER */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  🚌
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-[#005BAC]">
                    AJU SMART BUS
                  </p>

                  <p className="text-sm font-bold text-slate-700">
                    Email Verification
                  </p>
                </div>
              </div>

              {/* ROLE BADGE */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-[#005BAC]">
                <span className="h-2 w-2 rounded-full bg-[#005BAC]" />

                {role === "driver"
                  ? "DRIVER PORTAL"
                  : "STUDENT PORTAL"}
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Verify OTP
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Enter the 6-digit code sent to:
              </p>

              {/* EMAIL */}
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="break-all text-sm font-black text-[#005BAC]">
                  {email}
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      ⚠️
                    </span>

                    <div>
                      <p className="font-bold text-red-700">
                        Verification failed
                      </p>

                      <p className="mt-1 text-sm leading-6 text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SUCCESS */}
              {message && (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      ✅
                    </span>

                    <div>
                      <p className="font-bold text-green-700">
                        Verification successful
                      </p>

                      <p className="mt-1 text-sm leading-6 text-green-600">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP FORM */}
              <form
                onSubmit={handleVerifyOtp}
                className="mt-8"
              >
                <label
                  htmlFor="otp"
                  className="mb-3 block text-sm font-bold text-slate-700"
                >
                  Verification Code
                </label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    handleOtpChange(
                      event.target.value
                    )
                  }
                  placeholder="000000"
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5 text-center text-3xl font-black tracking-[0.45em] text-slate-900 outline-none transition placeholder:text-slate-300 focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-3 text-center text-xs font-medium text-slate-400">
                  Enter all 6 digits
                </p>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    resending ||
                    otp.length !== 6
                  }
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#005BAC] px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <span className="text-lg">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* RESEND */}
              <div className="mt-7 text-center">
                <p className="text-sm text-slate-500">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={
                    loading ||
                    resending
                  }
                  className="mt-2 text-sm font-black text-[#005BAC] transition hover:underline disabled:opacity-50"
                >
                  {resending
                    ? "Sending new code..."
                    : "Resend verification code"}
                </button>
              </div>

              {/* BACK */}
              <div className="mt-8 border-t border-slate-100 pt-7 text-center">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={
                    loading ||
                    resending
                  }
                  className="text-sm font-bold text-slate-500 transition hover:text-[#005BAC] disabled:opacity-50"
                >
                  ← Back to password recovery
                </button>
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">
                    🔒
                  </span>

                  <p className="text-xs leading-6 text-slate-500">
                    Never share your verification code with
                    anyone. AJU Smart Bus support will never
                    ask you for your OTP.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}