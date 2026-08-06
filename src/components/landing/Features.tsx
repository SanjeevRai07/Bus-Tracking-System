"use client";

import { motion } from "framer-motion";
import {
  BusFront,
  MapPinned,
  BellRing,
  Route,
  ShieldCheck,
  Clock3,
} from "lucide-react";

const features = [
  {
    icon: BusFront,
    title: "Live Bus Tracking",
    description: "Track every university bus in real time with GPS.",
  },
  {
    icon: MapPinned,
    title: "Live Route Map",
    description: "View complete bus routes and current location.",
  },
  {
    icon: Clock3,
    title: "ETA Prediction",
    description: "Know exactly when your bus will arrive.",
  },
  {
    icon: BellRing,
    title: "Smart Notifications",
    description: "Receive arrival and delay alerts instantly.",
  },
  {
    icon: Route,
    title: "Bus Schedule",
    description: "Daily route timings for all university buses.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Journey",
    description: "Emergency support and secure travel experience.",
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#005BAC]">
            Why Choose AJU Smart Bus?
          </h2>

          <p className="mt-4 text-gray-600">
            Everything students need for a smarter and safer campus commute.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg hover:shadow-2xl"
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#005BAC] text-white">
                  <Icon size={32} />
                </div>

                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 text-gray-600 leading-7">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}