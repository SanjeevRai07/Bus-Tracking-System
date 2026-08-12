"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DriverLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

      if (error) {
        console.log("LOGIN ERROR:", error);
        setError(error.message);
        return;
      }

      if (!data.user) {
        setError("Login failed.");
        return;
      }

      console.log("DRIVER LOGIN SUCCESS");

      router.push("/driver/dashboard");

    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#005BAC] text-4xl">
            🚌
          </div>

          <h1 className="mt-5 text-3xl font-bold text-[#005BAC]">
            Driver Login
          </h1>

          <p className="mt-2 text-slate-500">
            Login to start your trip
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <input
              type="email"
              placeholder="University Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-lg outline-none focus:border-[#005BAC]"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-lg outline-none focus:border-[#005BAC]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#005BAC] py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </main>
  );
}