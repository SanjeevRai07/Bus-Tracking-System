"use client";

import { motion } from "framer-motion";
import { Bus, MapPinned, Clock3 } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#005BAC] via-[#0E6FD8] to-[#003D73] text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-yellow-300 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-between px-6 py-20 lg:flex-row">

        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .8 }}
          className="max-w-xl"
        >
          <span className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-slate-900">
            🚍 ARKA JAIN UNIVERSITY
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight lg:text-7xl">
            Track Your
            <span className="text-yellow-300"> University Bus </span>
            In Real-Time
          </h1>

          <p className="mt-6 text-lg text-slate-200">
            Never miss your university bus again. Live GPS tracking,
            ETA prediction, schedules and instant notifications.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-xl bg-yellow-400 px-8 py-4 font-semibold text-slate-900 transition hover:scale-105">
              Track Bus
            </button>

            <button className="rounded-xl border border-white px-8 py-4 font-semibold transition hover:bg-white hover:text-[#005BAC]">
              View Routes
            </button>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity:0, x:60 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:.8 }}
          className="mt-16 lg:mt-0"
        >
          <div className="rounded-3xl bg-white/10 p-8 backdrop-blur-xl border border-white/20 shadow-2xl">

            <div className="flex justify-center">
              <div className="rounded-full bg-yellow-400 p-8">
                <Bus size={90} className="text-slate-900"/>
              </div>
            </div>

            <div className="mt-8 space-y-4">

              <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <MapPinned />
                  <span>Current Stop</span>
                </div>
                <span>Gate No.1</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <Clock3 />
                  <span>ETA</span>
                </div>
                <span>05 min</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/10 p-4">
                <span>Status</span>

                <span className="rounded-full bg-green-500 px-4 py-1 text-sm">
                  Live
                </span>
              </div>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}