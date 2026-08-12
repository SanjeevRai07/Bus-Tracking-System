"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DriverDashboard() {

  const router = useRouter();

  const [email, setEmail] = useState("");

  useEffect(() => {

    async function checkUser() {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/driver/login");
        return;
      }

      setEmail(user.email ?? "");

    }

    checkUser();

  }, [router]);

  async function logout() {

    await supabase.auth.signOut();

    router.replace("/driver/login");

  }

  return (

    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-[#005BAC] px-6 py-5 text-white shadow">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              AJU Smart Bus
            </h1>

            <p className="text-sm text-blue-100">
              Driver Dashboard
            </p>

          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-white px-5 py-2.5 font-semibold text-[#005BAC] hover:bg-blue-50"
          >
            Logout
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        <div className="rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="text-3xl font-bold text-slate-800">
            Welcome Driver 👋
          </h2>

          <p className="mt-2 text-slate-500">
            {email}
          </p>

        </div>


        {/* CARDS */}

        <div className="mt-6 grid gap-6 md:grid-cols-3">


          {/* BUS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="text-4xl">
              🚌
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#005BAC]">
              My Bus
            </h3>

            <p className="mt-2 text-slate-500">
              AJU Bus 01
            </p>

            <p className="mt-3 font-semibold text-green-600">
              ● Active
            </p>

          </div>


          {/* GPS */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="text-4xl">
              📍
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#005BAC]">
              Live GPS
            </h3>

            <p className="mt-2 text-slate-500">
              Track your current location.
            </p>

            <button
              className="mt-5 w-full rounded-xl bg-[#005BAC] py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start GPS
            </button>

          </div>


          {/* ROUTE */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="text-4xl">
              🗺️
            </div>

            <h3 className="mt-4 text-xl font-bold text-[#005BAC]">
              My Route
            </h3>

            <p className="mt-2 text-slate-500">
              AJU Route
            </p>

          </div>

        </div>

      </div>

    </main>

  );
}