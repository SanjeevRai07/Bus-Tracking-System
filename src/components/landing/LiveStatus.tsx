"use client";

import { Bus, Clock3, MapPin } from "lucide-react";
import { motion } from "framer-motion";


const buses = [
  {
    bus: "AJU-01",
    route: "Sakchi → University",
    eta: "5 Min",
    status: "Running",
  },
  {
    bus: "AJU-02",
    route: "Mango → University",
    eta: "8 Min",
    status: "Running",
  },
  {
    bus: "AJU-03",
    route: "Adityapur → University",
    eta: "12 Min",
    status: "Delayed",
  },
];

export default function LiveStatus() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#005BAC]">
            Live Bus Status
          </h2>

          <p className="mt-4 text-gray-500">
            Check the current location and arrival time of every university bus.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {buses.map((bus, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              className="rounded-3xl bg-white p-8 shadow-xl"
            >
              <div className="flex items-center justify-between">

                <div className="rounded-full bg-[#005BAC] p-4 text-white">
                  <Bus size={30}/>
                </div>

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    bus.status === "Running"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {bus.status}
                </span>

              </div>

              <h3 className="mt-6 text-2xl font-bold">
                {bus.bus}
              </h3>

              <div className="mt-6 space-y-4">

                <div className="flex items-center gap-3">
                  <MapPin className="text-[#005BAC]" />
                  <span>{bus.route}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 className="text-[#005BAC]" />
                  <span>ETA : {bus.eta}</span>
                </div>

              </div>

            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}