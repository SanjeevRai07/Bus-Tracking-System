"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [activeBus, setActiveBus] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBus((prev) => (prev === 3 ? 1 : prev + 1));
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-slate-900">

      {/* ================= NAVBAR ================= */}
      <nav className="fixed inset-x-0 top-0 z-[100]">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#082032]/90 px-4 py-3 shadow-2xl backdrop-blur-2xl sm:px-5">

            <Link href="/" className="group flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#075985] text-2xl shadow-lg shadow-sky-900/20 transition duration-300 group-hover:scale-105">
                🚌
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#082032] bg-[#14B8A6] shadow-[0_0_12px_rgba(20,184,166,.7)]" />
              </div>

              <div>
                <h1 className="text-base font-black tracking-tight text-white sm:text-lg">
                  AJU Smart Bus
                </h1>
                <p className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block">
                  Smart Transportation
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-semibold text-slate-300 transition hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-semibold text-slate-300 transition hover:text-white">
                How It Works
              </a>
              <a href="#access" className="text-sm font-semibold text-slate-300 transition hover:text-white">
                Portals
              </a>
            </div>

            <Link
              href="/student/login"
              className="group flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-[#075985] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-sky-50"
            >
              Get Started
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden bg-[#082032] pt-32">

        <div className="absolute -left-48 -top-40 h-[600px] w-[600px] rounded-full bg-[#075985]/30 blur-[140px]" />
        <div className="absolute -right-48 top-20 h-[600px] w-[600px] rounded-full bg-[#0EA5E9]/15 blur-[140px]" />
        <div className="absolute bottom-[-250px] left-[35%] h-[500px] w-[500px] rounded-full bg-[#14B8A6]/10 blur-[140px]" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 lg:pb-20 lg:pt-24">

          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">

            {/* HERO LEFT */}
            <div>

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2 text-[10px] font-black tracking-[0.15em] text-cyan-200 backdrop-blur-xl sm:text-xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6] shadow-[0_0_12px_rgba(20,184,166,.8)]" />
                SMART CAMPUS TRANSPORTATION
              </div>

              <h2 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Move Smarter.
                <br />

                <span className="bg-gradient-to-r from-[#7DD3FC] via-[#38BDF8] to-white bg-clip-text text-transparent">
                  Track Faster.
                </span>

                <br />

                Stay Connected.
              </h2>

              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                A next-generation university transportation platform that
                connects students, drivers and administrators through
                real-time GPS tracking.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/student/login"
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-white px-7 py-4 font-black text-[#075985] shadow-2xl transition duration-300 hover:-translate-y-1 hover:bg-sky-50"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-sky-100 to-transparent transition duration-700 group-hover:translate-x-full" />

                  <span className="relative">
                    Track Your Bus
                  </span>

                  <span className="relative transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <a
                  href="#features"
                  className="flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-4 font-bold text-white backdrop-blur-xl transition duration-300 hover:border-sky-300/30 hover:bg-white/10"
                >
                  Explore Platform
                </a>

              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="text-[#14B8A6]">✓</span>
                  Real-time GPS
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-[#14B8A6]">✓</span>
                  Live Updates
                </span>

                <span className="flex items-center gap-2">
                  <span className="text-[#14B8A6]">✓</span>
                  Secure Access
                </span>
              </div>

            </div>

            {/* ================= LIVE MAP ================= */}
            <div className="relative mx-auto w-full max-w-[560px]">

              <div className="absolute inset-8 rounded-[50px] bg-[#0EA5E9]/15 blur-[90px]" />

              <div className="relative rounded-[36px] border border-white/15 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-2xl sm:p-4">

                <div className="relative h-[470px] overflow-hidden rounded-[28px] bg-[#EEF5F8] sm:h-[530px]">

                  {/* MAP GRID */}
                  <div
                    className="absolute inset-0 opacity-50"
                    style={{
                      backgroundImage:
                        "linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)",
                      backgroundSize: "38px 38px",
                    }}
                  />

                  {/* ROADS */}
                  <div className="absolute -left-20 top-1/2 h-7 w-[700px] rotate-[-9deg] bg-white shadow-sm" />
                  <div className="absolute left-[24%] top-[-100px] h-[750px] w-6 rotate-[20deg] bg-white shadow-sm" />
                  <div className="absolute right-[22%] top-[-100px] h-[750px] w-8 rotate-[-28deg] bg-white shadow-sm" />
                  <div className="absolute -left-20 top-[76%] h-5 w-[700px] rotate-[8deg] bg-white shadow-sm" />

                  {/* GREEN AREAS */}
                  <div className="absolute left-[5%] top-[8%] h-24 w-32 rounded-[40%] bg-emerald-100/60 blur-sm" />
                  <div className="absolute bottom-[30%] right-[5%] h-28 w-36 rounded-[40%] bg-emerald-100/60 blur-sm" />

                  {/* ROUTE */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 560 530"
                    fill="none"
                  >
                    <path
                      d="M80 430 C120 350, 145 390, 205 315 C270 235, 315 275, 350 190 C380 115, 440 135, 490 65"
                      stroke="#0EA5E9"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="14 11"
                    />

                    <path
                      d="M80 430 C120 350, 145 390, 205 315 C270 235, 315 275, 350 190 C380 115, 440 135, 490 65"
                      stroke="#075985"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4 14"
                    />
                  </svg>

                  {/* LIVE BADGE */}
                  <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-[#14B8A6]/50" />
                        <span className="relative h-2.5 w-2.5 rounded-full bg-[#14B8A6]" />
                      </span>

                      <span className="text-[10px] font-black tracking-wider text-[#0F172A]">
                        LIVE NETWORK
                      </span>
                    </div>
                  </div>

                  {/* ETA */}
                  <div className="absolute right-4 top-4 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Next Arrival
                    </p>

                    <div className="mt-1 flex items-end gap-1">
                      <p className="text-2xl font-black text-[#075985]">
                        06
                      </p>

                      <p className="mb-1 text-xs font-bold text-slate-500">
                        min
                      </p>
                    </div>
                  </div>

                  {/* BUS 1 */}
                  <div
                    className={`absolute left-[57%] top-[42%] transition-all duration-700 ${
                      activeBus === 1 ? "scale-125" : "scale-100"
                    }`}
                  >
                    {activeBus === 1 && (
                      <div className="absolute -inset-7 animate-ping rounded-full bg-[#0EA5E9]/20" />
                    )}

                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#075985] to-[#0EA5E9] text-3xl shadow-xl">
                      🚌
                    </div>
                  </div>

                  {/* BUS 2 */}
                  <div
                    className={`absolute left-[26%] top-[67%] transition-all duration-700 ${
                      activeBus === 2 ? "scale-125" : "scale-100"
                    }`}
                  >
                    {activeBus === 2 && (
                      <div className="absolute -inset-6 animate-ping rounded-full bg-[#0EA5E9]/20" />
                    )}

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#075985] text-xl shadow-xl">
                      🚌
                    </div>
                  </div>

                  {/* BUS 3 */}
                  <div
                    className={`absolute right-[14%] top-[20%] transition-all duration-700 ${
                      activeBus === 3 ? "scale-125" : "scale-100"
                    }`}
                  >
                    {activeBus === 3 && (
                      <div className="absolute -inset-6 animate-ping rounded-full bg-[#0EA5E9]/20" />
                    )}

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-[#075985] text-xl shadow-xl">
                      🚌
                    </div>
                  </div>

                  {/* BOTTOM BUS CARD */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/80 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 text-2xl">
                          🚌
                        </div>

                        <div>
                          <p className="text-sm font-black text-[#0F172A]">
                            AJU Bus 07
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Main Campus Route
                          </p>
                        </div>

                      </div>

                      <div className="rounded-full bg-emerald-50 px-3 py-1.5">
                        <p className="text-[10px] font-black text-[#0F766E]">
                          ● LIVE
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">

                      <div>
                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          Speed
                        </p>
                        <p className="mt-1 text-xs font-black text-slate-800">
                          32 km/h
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          GPS
                        </p>
                        <p className="mt-1 text-xs font-black text-[#0F766E]">
                          Excellent
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase text-slate-400">
                          Status
                        </p>
                        <p className="mt-1 text-xs font-black text-slate-800">
                          On Route
                        </p>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

              {/* FLOATING GPS */}
              <div className="absolute -left-5 top-[35%] hidden animate-float rounded-2xl border border-white/15 bg-[#082032]/90 p-3 shadow-2xl backdrop-blur-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#14B8A6]/15">
                    📍
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      GPS Updated
                    </p>

                    <p className="text-[9px] text-slate-400">
                      Just now
                    </p>
                  </div>

                </div>
              </div>

              {/* FLOATING UPDATE */}
              <div className="absolute -right-4 bottom-[20%] hidden animate-float rounded-2xl border border-white/15 bg-[#082032]/90 p-3 shadow-2xl backdrop-blur-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0EA5E9]/15">
                    ⚡
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-white">
                      Live Updates
                    </p>

                    <p className="text-[9px] text-slate-400">
                      Connected
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ================= STATS ================= */}
          <div className="mx-auto mt-16 max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">

            <div className="grid grid-cols-2 md:grid-cols-4">

              {[
                ["24/7", "GPS Availability"],
                ["LIVE", "Location Updates"],
                ["SMART", "Fleet Management"],
                ["SECURE", "User Access"],
              ].map(([value, label], index) => (
                <div
                  key={label}
                  className={`p-6 text-center transition hover:bg-white/[0.04] ${
                    index !== 3 ? "border-r border-white/10" : ""
                  } ${
                    index < 2 ? "border-b md:border-b-0" : ""
                  }`}
                >
                  <p className="text-2xl font-black text-white">
                    {value}
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-slate-400">
                    {label}
                  </p>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="bg-white py-24 sm:py-32">

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <span className="rounded-full bg-sky-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#075985]">
              Powerful Platform
            </span>

            <h2 className="mt-6 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
              Built for a{" "}
              <span className="text-[#075985]">
                smarter campus.
              </span>
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-500">
              Everything required to make university transportation more
              transparent, connected and efficient.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {[
              {
                icon: "📍",
                title: "Real-Time GPS",
                text: "Track active university buses and view their current location in real time.",
              },
              {
                icon: "🗺️",
                title: "Interactive Maps",
                text: "Understand bus movement through a clean and intuitive live tracking experience.",
              },
              {
                icon: "⚡",
                title: "Instant Updates",
                text: "Location changes are reflected quickly so students always have the latest information.",
              },
              {
                icon: "🚌",
                title: "Fleet Management",
                text: "Give administrators a complete view of buses, routes and transportation operations.",
              },
              {
                icon: "👨‍✈️",
                title: "Driver Tracking",
                text: "Drivers can securely share their GPS location while operating their assigned bus.",
              },
              {
                icon: "🔐",
                title: "Secure Portals",
                text: "Separate experiences for students, drivers and administrators with protected access.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl"
              >

                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-500/5 blur-3xl transition group-hover:bg-sky-500/15" />

                <div className="relative">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 text-3xl shadow-inner transition duration-300 group-hover:scale-110 group-hover:rotate-2">
                    {feature.icon}
                  </div>

                  <h3 className="mt-7 text-xl font-black text-[#0F172A]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.text}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-xs font-black text-[#075985]">
                    Learn more
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section
        id="how-it-works"
        className="relative overflow-hidden bg-[#F1F6F9] py-24 sm:py-32"
      >

        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-sky-400/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-teal-400/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

          <div className="text-center">

            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#075985] shadow-sm">
              Simple Experience
            </span>

            <h2 className="mt-6 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
              How it works
            </h2>
          </div>

          <div className="relative mt-16 grid gap-10 md:grid-cols-3">

            <div className="absolute left-[20%] right-[20%] top-10 hidden h-px bg-gradient-to-r from-sky-200 via-sky-400 to-sky-200 md:block" />

            {[
              {
                number: "01",
                icon: "🔐",
                title: "Sign In",
                text: "Choose your dedicated portal and securely access the platform.",
              },
              {
                number: "02",
                icon: "📡",
                title: "Connect",
                text: "Drivers share live GPS while the system processes location updates.",
              },
              {
                number: "03",
                icon: "🚌",
                title: "Track",
                text: "Students instantly see active buses and their latest locations.",
              },
            ].map((step) => (
              <div key={step.number} className="relative text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-[#F1F6F9] bg-gradient-to-br from-[#075985] to-[#0EA5E9] text-3xl text-white shadow-xl shadow-sky-900/15 transition duration-300 hover:scale-110 hover:shadow-sky-500/30">
                  {step.icon}
                </div>

                <span className="mt-5 inline-block rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black tracking-wider text-[#075985]">
                  STEP {step.number}
                </span>

                <h3 className="mt-3 text-xl font-black text-[#0F172A]">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  {step.text}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= PORTALS ================= */}
      <section id="access" className="bg-white py-24 sm:py-32">

        <div className="mx-auto max-w-7xl px-5 sm:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <span className="rounded-full bg-sky-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#075985]">
              Secure Access
            </span>

            <h2 className="mt-6 text-4xl font-black tracking-tight text-[#0F172A] sm:text-5xl">
              One platform.
              <br />

              <span className="text-[#075985]">
                Three experiences.
              </span>
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {[
              {
                href: "/student/login",
                icon: "🎓",
                title: "Student Portal",
                description:
                  "Track active buses and view live transportation information.",
                label: "Student Login",
              },
              {
                href: "/driver/login",
                icon: "👨‍✈️",
                title: "Driver Portal",
                description:
                  "Start GPS tracking and securely share your live bus location.",
                label: "Driver Login",
              },
              {
                href: "/admin/login",
                icon: "🛡️",
                title: "Admin Portal",
                description:
                  "Manage buses, drivers, routes and transportation operations.",
                label: "Admin Login",
              },
            ].map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white to-sky-50/40 p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-sky-200 hover:shadow-2xl"
              >

                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-500/5 blur-3xl transition group-hover:bg-sky-500/15" />

                <div className="absolute left-0 top-0 h-1 w-0 bg-gradient-to-r from-[#075985] to-[#0EA5E9] transition-all duration-500 group-hover:w-full" />

                <div className="relative">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 text-3xl shadow-inner transition duration-300 group-hover:scale-110">
                    {portal.icon}
                  </div>

                  <h3 className="mt-7 text-2xl font-black text-[#0F172A]">
                    {portal.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {portal.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 font-black text-[#075985]">
                    {portal.label}

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden bg-[#082032] py-24 sm:py-32">

        <div className="absolute -left-40 top-0 h-[400px] w-[400px] rounded-full bg-[#075985]/30 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-[#0EA5E9]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-3xl shadow-xl backdrop-blur-xl">
            🚌
          </div>

          <h2 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Never wonder where
            <br />
            your bus is again.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-slate-300 sm:text-base">
            Experience smarter, faster and more connected campus
            transportation with AJU Smart Bus.
          </p>

          <Link
            href="/student/login"
            className="group mt-9 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-black text-[#075985] shadow-2xl transition duration-300 hover:-translate-y-1 hover:bg-sky-50"
          >
            Start Tracking

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#061621] py-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 sm:px-8 md:flex-row">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#075985] text-xl">
              🚌
            </div>

            <div>
              <p className="text-sm font-black text-white">
                AJU Smart Bus
              </p>

              <p className="text-xs text-slate-500">
                Smart Campus Transportation
              </p>
            </div>

          </div>

          <p className="text-xs text-slate-500">
            © 2026 AJU Smart Bus. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs font-bold text-[#14B8A6]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6]" />
            All Systems Operational
          </div>

        </div>
      </footer>

    </main>
  );
}