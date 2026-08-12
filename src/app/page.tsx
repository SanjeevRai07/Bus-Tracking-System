"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f9ff]">

      {/* =========================================
          BACKGROUND EFFECTS
      ========================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-300/20 blur-3xl" />

        <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-300/10 blur-3xl" />

        {/* GRID */}

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#005BAC 1px, transparent 1px), linear-gradient(90deg, #005BAC 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

      </div>

      {/* =========================================
          NAVBAR
      ========================================== */}

      <header className="relative z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#005BAC] to-blue-400 text-2xl shadow-lg shadow-blue-500/20">
              🚌
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#005BAC]">
                AJU Smart Bus
              </h1>

              <p className="text-xs font-medium text-slate-500">
                UNIVERSITY TRANSPORT SYSTEM
              </p>
            </div>

          </div>

          {/* LIVE STATUS */}

          <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 sm:flex">

            <span className="relative flex h-3 w-3">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />

            </span>

            <span className="text-sm font-semibold text-green-700">
              System Online
            </span>

          </div>

        </div>

      </header>

      {/* =========================================
          HERO
      ========================================== */}

      <section className="relative z-10 px-6 pb-16 pt-16 md:pt-20">

        <div className="mx-auto max-w-7xl">

          {/* HERO TEXT */}

          <div className="mx-auto max-w-4xl text-center">

            {/* BADGE */}

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-[#005BAC] shadow-sm backdrop-blur">

              <span className="text-base">
                ✨
              </span>

              Smart University Transportation

            </div>

            <h2 className="text-5xl font-black tracking-tight text-slate-900 md:text-6xl lg:text-7xl">

              Travel Smarter.

              <span className="block bg-gradient-to-r from-[#005BAC] via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Track Faster.
              </span>

            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">

              A modern university bus tracking platform
              that connects students, drivers and
              administrators in real time.

            </p>

          </div>

          {/* =====================================
              LOGIN SECTION
          ====================================== */}

          <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">

            {/* =================================
                STUDENT
            ================================== */}

            <button
              type="button"
              onClick={() =>
                router.push("/student/login")
              }
              className="group relative overflow-hidden rounded-3xl border border-white bg-white/80 p-7 text-left shadow-xl shadow-blue-900/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-500/15"
            >

              {/* TOP GLOW */}

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl transition group-hover:bg-blue-400/40" />

              <div className="relative">

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-[#005BAC] text-4xl shadow-lg shadow-blue-500/20 transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                    🎓
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                    STUDENT
                  </span>

                </div>

                <h3 className="text-2xl font-bold text-slate-800">
                  Student Portal
                </h3>

                <p className="mt-3 min-h-[52px] leading-6 text-slate-500">
                  Track your university bus, check routes
                  and see live arrival information.
                </p>

                <div className="mt-7 flex items-center justify-between">

                  <span className="font-bold text-[#005BAC]">
                    Login to Portal
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-xl text-[#005BAC] transition group-hover:translate-x-1 group-hover:bg-[#005BAC] group-hover:text-white">
                    →
                  </span>

                </div>

              </div>

            </button>

            {/* =================================
                DRIVER
            ================================== */}

            <button
              type="button"
              onClick={() =>
                router.push("/driver/login")
              }
              className="group relative overflow-hidden rounded-3xl border border-white bg-white/80 p-7 text-left shadow-xl shadow-green-900/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-green-500/15"
            >

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-green-400/20 blur-3xl transition group-hover:bg-green-400/40" />

              <div className="relative">

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-4xl shadow-lg shadow-green-500/20 transition duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    🚌
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                    DRIVER
                  </span>

                </div>

                <h3 className="text-2xl font-bold text-slate-800">
                  Driver Portal
                </h3>

                <p className="mt-3 min-h-[52px] leading-6 text-slate-500">
                  Manage your assigned bus, route and
                  share your live GPS location.
                </p>

                <div className="mt-7 flex items-center justify-between">

                  <span className="font-bold text-green-600">
                    Login to Portal
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-xl text-green-600 transition group-hover:translate-x-1 group-hover:bg-green-600 group-hover:text-white">
                    →
                  </span>

                </div>

              </div>

            </button>

            {/* =================================
                ADMIN
            ================================== */}

            <button
              type="button"
              onClick={() =>
                router.push("/admin/login")
              }
              className="group relative overflow-hidden rounded-3xl border border-white bg-white/80 p-7 text-left shadow-xl shadow-purple-900/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-500/15"
            >

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-400/20 blur-3xl transition group-hover:bg-purple-400/40" />

              <div className="relative">

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-700 text-4xl shadow-lg shadow-purple-500/20 transition duration-500 group-hover:scale-110 group-hover:rotate-3">
                    🛡️
                  </div>

                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-600">
                    ADMIN
                  </span>

                </div>

                <h3 className="text-2xl font-bold text-slate-800">
                  Admin Portal
                </h3>

                <p className="mt-3 min-h-[52px] leading-6 text-slate-500">
                  Manage buses, drivers, routes, students
                  and real-time tracking.
                </p>

                <div className="mt-7 flex items-center justify-between">

                  <span className="font-bold text-purple-600">
                    Login to Portal
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-xl text-purple-600 transition group-hover:translate-x-1 group-hover:bg-purple-600 group-hover:text-white">
                    →
                  </span>

                </div>

              </div>

            </button>

          </div>

          {/* =====================================
              FEATURES
          ====================================== */}

          <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3">

            <Feature
              icon="📍"
              title="Live GPS Tracking"
              text="Track buses in real time"
            />

            <Feature
              icon="🗺️"
              title="Smart Routes"
              text="View routes and bus stops"
            />

            <Feature
              icon="🔐"
              title="Secure Access"
              text="Separate portals for every role"
            />

          </div>

          {/* =====================================
              BOTTOM STATS
          ====================================== */}

          <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-10 border-t border-slate-200/70 pt-8">

            <Stat
              number="24/7"
              label="Tracking"
            />

            <Stat
              number="3"
              label="User Portals"
            />

            <Stat
              number="GPS"
              label="Live Location"
            />

            <Stat
              number="100%"
              label="Connected"
            />

          </div>

          {/* FOOTER */}

          <p className="mt-12 text-center text-sm text-slate-400">
            © 2026 AJU Smart Bus · ARKA JAIN University
          </p>

        </div>

      </section>

    </main>
  );
}

/* ============================================
   FEATURE COMPONENT
============================================ */

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white bg-white/70 p-5 shadow-sm backdrop-blur-xl">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">
        {icon}
      </div>

      <div>

        <h4 className="font-bold text-slate-800">
          {title}
        </h4>

        <p className="mt-1 text-sm text-slate-500">
          {text}
        </p>

      </div>

    </div>
  );
}

/* ============================================
   STAT COMPONENT
============================================ */

function Stat({
  number,
  label,
}: {
  number: string;
  label: string;
}) {
  return (
    <div className="text-center">

      <p className="text-2xl font-black text-[#005BAC]">
        {number}
      </p>

      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

    </div>
  );
}