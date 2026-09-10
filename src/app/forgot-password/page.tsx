"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role");
  const role = roleParam === "driver" ? "driver" : "student";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const title =
    role === "driver"
      ? "Driver Password Recovery"
      : "Student Password Recovery";

  const subtitle =
    role === "driver"
      ? "Enter your registered driver email to receive a verification code."
      : "Enter your registered student email to receive a verification code.";

  const loginPath =
    role === "driver" ? "/driver/login" : "/student/login";

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      setError("Please enter a valid email address.");
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
        throw otpError;
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
        "A 6-digit verification code has been sent to your email."
      );

      setTimeout(() => {
        router.push(`/verify-otp?role=${role}`);
      }, 800);
    } catch (err) {
      console.error(
        "Forgot password OTP error:",
        err
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to send verification code.";

      if (
        errorMessage
          .toLowerCase()
          .includes("rate limit")
      ) {
        setError(
          "Too many OTP requests. Please wait a few minutes and try again."
        );
      } else if (
        errorMessage
          .toLowerCase()
          .includes("user not found")
      ) {
        setError(
          "No account was found with this email address."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 px-5 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
          {/* LEFT SIDE */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#004A91] via-[#005BAC] to-[#0074D9] p-10 text-white lg:flex lg:min-h-[650px] lg:flex-col lg:justify-between">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />

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
                    Password Recovery
                  </h1>
                </div>
              </div>

              <div className="mt-24">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                  Secure Account Access
                </p>

                <h2 className="mt-5 max-w-lg text-4xl font-black leading-tight">
                  Recover your account safely.
                </h2>

                <p className="mt-6 max-w-lg text-base leading-8 text-blue-100">
                  We will send a verification code to your
                  registered email address. Use that code to
                  continue and create a new password.
                </p>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  🔐
                </div>

                <div>
                  <p className="font-bold">
                    Secure verification
                  </p>

                  <p className="mt-1 text-xs text-blue-100">
                    Verification is required before changing
                    your password.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section className="flex min-h-[650px] items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              {/* MOBILE BRANDING */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  🚌
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-[#005BAC]">
                    AJU SMART BUS
                  </p>

                  <p className="text-sm font-bold text-slate-700">
                    Password Recovery
                  </p>
                </div>
              </div>

              {/* HEADING */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-[#005BAC]">
                  <span className="h-2 w-2 rounded-full bg-[#005BAC]" />
                  {role === "driver"
                    ? "DRIVER PORTAL"
                    : "STUDENT PORTAL"}
                </div>

                <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Forgot Password?
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {subtitle}
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
                        Unable to continue
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
                        Verification code sent
                      </p>

                      <p className="mt-1 text-sm leading-6 text-green-600">
                        {message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM */}
              <form
                onSubmit={handleSendOtp}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Registered Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your registered email"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#005BAC] px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <span className="text-lg">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* INFO */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm">
                    ℹ️
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      How it works
                    </p>

                    <p className="mt-1 text-xs leading-6 text-slate-500">
                      Enter your registered email, receive
                      the verification code, verify it, and
                      then set your new password.
                    </p>
                  </div>
                </div>
              </div>

              {/* BACK TO LOGIN */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => router.push(loginPath)}
                  disabled={loading}
                  className="text-sm font-bold text-[#005BAC] transition hover:underline disabled:opacity-50"
                >
                  ← Back to{" "}
                  {role === "driver"
                    ? "Driver"
                    : "Student"}{" "}
                  Login
                </button>
              </div>

              <p className="mt-8 text-center text-xs font-medium text-slate-400">
                {title}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ForgotPasswordLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5">
      <div className="rounded-3xl bg-white px-10 py-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
          🚌
        </div>

        <p className="mt-4 text-sm font-bold text-[#005BAC]">
          Loading password recovery...
        </p>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}