"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // CHECK EXISTING SESSION
  // ====================================================

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        router.replace("/admin/dashboard");
        return;
      }

      setCheckingSession(false);
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  // ====================================================
  // LOGIN
  // ====================================================

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError(
        "Please enter admin email."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter admin password."
      );
      return;
    }

    setLoading(true);

    try {
      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: email.trim(),
            password,
          }
        );

      if (loginError) {
        setError(
          loginError.message
        );
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError(
          "Login failed. Please try again."
        );
        setLoading(false);
        return;
      }

      // Replace instead of push so login
      // does not remain as a normal history step.
      router.replace(
        "/admin/dashboard"
      );

      router.refresh();
    } catch (loginException) {
      console.error(
        "Admin login error:",
        loginException
      );

      setError(
        "Something went wrong during login."
      );

      setLoading(false);
    }
  }

  // ====================================================
  // SESSION CHECK SCREEN
  // ====================================================

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-[#005BAC]
                border-t-transparent
              "
            />

            <span className="font-semibold text-slate-700">
              Checking admin session...
            </span>
          </div>
        </div>
      </main>
    );
  }

  // ====================================================
  // LOGIN UI
  // ====================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">

        {/* =================================================
            LOGO / TITLE
        ================================================= */}

        <div className="mb-8 text-center">

          <div
            className="
              mx-auto
              mb-4
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[#005BAC]
              text-3xl
              shadow-lg
            "
          >
            🚌
          </div>

          <h1 className="text-3xl font-bold text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-slate-500">
            Administrator Login
          </p>
        </div>

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-8
            shadow-xl
          "
        >

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-slate-800">
              Admin Login
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Sign in to manage the AJU Smart Bus
              system.
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mb-5
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                font-medium
                text-red-600
              "
            >
              ⚠️ {error}
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="admin-email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Admin Email
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="Enter admin email"
                autoComplete="email"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-[#005BAC]
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:bg-slate-50
                "
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="admin-password"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter admin password"
                autoComplete="current-password"
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  outline-none
                  transition
                  focus:border-[#005BAC]
                  focus:ring-2
                  focus:ring-blue-100
                  disabled:bg-slate-50
                "
              />

            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-[#005BAC]
                px-5
                py-3
                font-semibold
                text-white
                shadow-md
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Signing in..."
                : "Login as Admin"}
            </button>

          </form>

          {/* =================================================
              ADMIN INFO
          ================================================= */}

          <div
            className="
              mt-6
              rounded-xl
              bg-blue-50
              p-4
            "
          >

            <p className="text-sm font-semibold text-[#005BAC]">
              Administrator Access
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
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