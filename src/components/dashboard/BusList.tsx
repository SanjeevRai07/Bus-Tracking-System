"use client";

import { BusFront } from "lucide-react";

const buses = [
  {
    number: "AJU-01",
    route: "Sakchi → AJU",
    status: "Running",
    eta: "5 min",
  },
  {
    number: "AJU-02",
    route: "Mango → AJU",
    status: "Running",
    eta: "8 min",
  },
  {
    number: "AJU-03",
    route: "Adityapur → AJU",
    status: "Delayed",
    eta: "15 min",
  },
];

export default function BusList() {
  return (
    <div className="mt-10 rounded-3xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-[#005BAC]">
        Running Buses
      </h2>

      <div className="space-y-4">
        {buses.map((bus) => (
          <div
            key={bus.number}
            className="flex items-center justify-between rounded-xl border p-4"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <BusFront className="text-[#005BAC]" />
              </div>

              <div>
                <h3 className="font-semibold">{bus.number}</h3>
                <p className="text-sm text-gray-500">{bus.route}</p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  bus.status === "Running"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {bus.status}
              </span>

              <p className="mt-2 text-sm text-gray-500">
                ETA: {bus.eta}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}