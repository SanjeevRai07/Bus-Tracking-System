"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type UserRole = "student" | "driver";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole>("student");
  const [checking, setChecking] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkResetAccess() {
      try {
        const savedRole =
          sessionStorage.getItem("aju_reset_role");

        const savedEmail =
          sessionStorage.getItem("aju_reset_email");

        const resetVerified =
          sessionStorage.getItem(
            "aju_password_reset_verified"
          );

        if (savedRole === "driver") {
          if (mounted) {
            setRole("driver");
          }
        } else {
          if (mounted) {
            setRole("student");
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        /*
         * A valid Supabase session is required because
         * updateUser({ password }) works on the authenticated
         * recovery session.
         */
        if (!session?.user) {
          router.replace(
            savedRole === "driver"
              ? "/driver/login"
              : "/student/login"
          );
          return;
        }

        /*
         * The email stored during the OTP flow should match
         * the currently authenticated recovery session.
         */
        if (
          savedEmail &&
          session.user.email &&
          savedEmail.toLowerCase() !==
            session.user.email.toLowerCase()
        ) {
          sessionStorage.removeItem("aju_reset_email");
          sessionStorage.removeItem("aju_reset_role");
          sessionStorage.removeItem(
            "aju_password_reset_verified"
          );

          await supabase.auth.signOut();

          router.replace(
            savedRole === "driver"
              ? "/driver/login"
              : "/student/login"
          );
          return;
        }

        /*
         * If OTP verification was not completed, send the user
         * back to the verification page.
         */
        if (resetVerified !== "true") {
          router.replace(
            savedRole === "driver"
              ? "/verify-otp?role=driver"
              : "/verify-otp?role=student"
          );
          return;
        }

        if (mounted) {
          setChecking(false);
        }
      } catch (err) {
        console.error(
          "Reset password access error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify password reset access."
          );
          setChecking(false);
        }
      }
    }

    checkResetAccess();

    return () => {
      mounted = false;
    };
  }, [router]);

  function validatePassword(value: string) {
    if (value.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter.";
    }

    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Password must contain at least one special character.";
    }

    return "";
  }

  async function handleResetPassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Your password reset session has expired. Please request a new verification code."
        );
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      /*
       * Reset flow is now complete.
       */
      sessionStorage.removeItem(
        "aju_reset_email"
      );
      sessionStorage.removeItem(
        "aju_reset_role"
      );
      sessionStorage.removeItem(
        "aju_password_reset_verified"
      );

      setMessage(
        "Password updated successfully. Redirecting to login..."
      );

      /*
       * Sign out after changing the password so the user
       * explicitly logs in with the new password.
       */
      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace(
          role === "driver"
            ? "/driver/login?reset=success"
            : "/student/login?reset=success"
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to update your password.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 px-5">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-9 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
            🔐
          </div>

          <h1 className="mt-5 text-xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Verifying password reset session...
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
                    Account Security
                  </h1>
                </div>
              </div>

              <div className="mt-28">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                  Create New Password
                </p>

                <h2 className="mt-5 max-w-lg text-4xl font-black leading-tight">
                  Secure your account with a new password.
                </h2>

                <p className="mt-6 max-w-lg text-base leading-8 text-blue-100">
                  Choose a strong password containing uppercase
                  letters, lowercase letters, numbers, and special
                  characters.
                </p>
              </div>
            </div>

            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  🛡️
                </div>

                <div>
                  <p className="font-bold">
                    Password requirements
                  </p>

                  <p className="mt-1 text-xs leading-6 text-blue-100">
                    Minimum 8 characters with uppercase, lowercase,
                    number, and special character.
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
                    Reset Password
                  </p>
                </div>
              </div>

              {/* BADGE */}
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-black text-[#005BAC]">
                <span className="h-2 w-2 rounded-full bg-[#005BAC]" />

                {role === "driver"
                  ? "DRIVER PORTAL"
                  : "STUDENT PORTAL"}
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Create New Password
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Enter and confirm your new password below.
              </p>

              {/* ERROR */}
              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">
                      ⚠️
                    </span>

                    <div>
                      <p className="font-bold text-red-700">
                        Unable to reset password
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
                        Password updated
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
                onSubmit={handleResetPassword}
                className="mt-8 space-y-5"
              >
                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    New Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter new password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#005BAC] focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* REQUIREMENTS */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Password must contain
                  </p>

                  <div className="mt-3 grid gap-2 text-xs font-semibold sm:grid-cols-2">
                    <p
                      className={
                        password.length >= 8
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {password.length >= 8 ? "✓" : "○"} 8+ characters
                    </p>

                    <p
                      className={
                        /[a-z]/.test(password)
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {/[a-z]/.test(password)
                        ? "✓"
                        : "○"}{" "}
                      Lowercase letter
                    </p>

                    <p
                      className={
                        /[A-Z]/.test(password)
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {/[A-Z]/.test(password)
                        ? "✓"
                        : "○"}{" "}
                      Uppercase letter
                    </p>

                    <p
                      className={
                        /[0-9]/.test(password)
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {/[0-9]/.test(password)
                        ? "✓"
                        : "○"}{" "}
                      Number
                    </p>

                    <p
                      className={
                        /[^A-Za-z0-9]/.test(password)
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {/[^A-Za-z0-9]/.test(password)
                        ? "✓"
                        : "○"}{" "}
                      Special character
                    </p>

                    <p
                      className={
                        password &&
                        confirmPassword &&
                        password === confirmPassword
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {password &&
                      confirmPassword &&
                      password === confirmPassword
                        ? "✓"
                        : "○"}{" "}
                      Passwords match
                    </p>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#005BAC] px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#004A91] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Update Password
                      <span className="text-lg">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* BACK */}
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      role === "driver"
                        ? "/driver/login"
                        : "/student/login"
                    )
                  }
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}