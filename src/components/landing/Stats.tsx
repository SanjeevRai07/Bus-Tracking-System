"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  BusFront,
  Users,
  MapPinned,
  Clock3,
} from "lucide-react";

const stats = [
  {
    icon: BusFront,
    value: 25,
    suffix: "+",
    title: "University Buses",
  },
  {
    icon: Users,
    value: 6000,
    suffix: "+",
    title: "Students",
  },
  {
    icon: MapPinned,
    value: 120,
    suffix: "+",
    title: "Bus Stops",
  },
  {
    icon: Clock3,
    value: 99,
    suffix: "%",
    title: "On Time",
  },
];

export default function Stats() {
  return (
    <section className="bg-[#005BAC] py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold">
            AJU Bus Network
          </h2>

          <p className="mt-4 text-blue-100">
            Smart transportation for every student.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="rounded-3xl bg-white/10 p-8 backdrop-blur-lg border border-white/20 text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-slate-900">
                  <Icon size={30} />
                </div>

                <h3 className="text-5xl font-bold text-yellow-300">
                  <CountUp
                    end={item.value}
                    duration={3}
                  />
                  {item.suffix}
                </h3>

                <p className="mt-4 text-lg">
                  {item.title}
                </p>

              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
}