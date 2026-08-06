"use client";

import { MapPin, BusFront, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export default function CampusPreview() {
  return (
    <section className="bg-slate-100 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#005BAC]">
            Live Campus Bus Map
          </h2>

          <p className="mt-4 text-gray-600">
            View buses, stops and university location in one place.
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">

          {/* Map Preview */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative h-[500px] rounded-3xl bg-gradient-to-br from-blue-100 to-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>

            {/* University */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="rounded-full bg-[#005BAC] p-5 text-white shadow-xl">
                <MapPin size={34} />
              </div>

              <p className="mt-3 text-center font-semibold text-[#005BAC]">
                ARKA JAIN University
              </p>
            </div>

            {/* Bus */}
            <motion.div
              animate={{
                x: [0, 180, 0],
                y: [0, -60, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
              }}
              className="absolute left-16 top-20 rounded-full bg-yellow-400 p-4 shadow-xl"
            >
              <BusFront className="text-slate-900" size={28} />
            </motion.div>

            {/* Bus Stop */}
            <div className="absolute right-16 bottom-20 rounded-full bg-red-500 p-4 text-white shadow-xl">
              <Navigation size={26} />
            </div>
          </motion.div>

          {/* Information */}
          <div className="flex flex-col justify-center">

            <h3 className="text-3xl font-bold text-[#005BAC]">
              Smart GPS Tracking
            </h3>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Students can track buses live, check estimated arrival
              time, view complete routes and receive instant alerts
              whenever a bus is nearby.
            </p>

            <div className="mt-10 space-y-6">

              <div className="rounded-2xl bg-white p-6 shadow">
                🚌 Live Bus Position
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                📍 Bus Stops
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                ⏱ ETA Prediction
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                🔔 Smart Notifications
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}