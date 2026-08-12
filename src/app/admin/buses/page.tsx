"use client";

import { useState } from "react";

interface Bus {
  id: number;
  busNumber: string;
  driver: string;
  route: string;
  status: "Running" | "Stopped";
  gps: "Active" | "Inactive";
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([
    {
      id: 1,
      busNumber: "AJU Bus 01",
      driver: "Sanjeev Kumar Rai",
      route: "AJU Route",
      status: "Running",
      gps: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    busNumber: "",
    driver: "",
    route: "",
  });

  function addBus() {
    if (!form.busNumber || !form.driver || !form.route) return;

    const newBus: Bus = {
      id: Date.now(),
      busNumber: form.busNumber,
      driver: form.driver,
      route: form.route,
      status: "Stopped",
      gps: "Inactive",
    };

    setBuses((prev) => [...prev, newBus]);

    setForm({
      busNumber: "",
      driver: "",
      route: "",
    });

    setShowForm(false);
  }

  function deleteBus(id: number) {
    setBuses((prev) => prev.filter((bus) => bus.id !== id));
  }

  function toggleStatus(id: number) {
    setBuses((prev) =>
      prev.map((bus) =>
        bus.id === id
          ? {
              ...bus,
              status: bus.status === "Running" ? "Stopped" : "Running",
              gps: bus.status === "Running" ? "Inactive" : "Active",
            }
          : bus
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#005BAC]">
            Bus Management
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            Manage university buses and their GPS status.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-[#005BAC] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
        >
          + Add New Bus
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Buses</p>
          <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
            {buses.length}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Registered buses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Running</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {buses.filter((bus) => bus.status === "Running").length}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Currently active
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Stopped</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-500">
            {buses.filter((bus) => bus.status === "Stopped").length}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Currently stopped
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">GPS Active</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {buses.filter((bus) => bus.gps === "Active").length}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            GPS connected
          </p>
        </div>
      </div>

      {/* Bus Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-2xl font-bold text-[#005BAC]">
            All Buses
          </h2>

          <p className="mt-1 text-slate-500">
            View and manage registered university buses.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-500">
                <th className="px-6 py-4">Bus</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">GPS</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {buses.map((bus) => (
                <tr
                  key={bus.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-2xl">
                        🚌
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {bus.busNumber}
                        </p>

                        <p className="text-sm text-slate-400">
                          ID #{bus.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 font-medium text-slate-700">
                    {bus.driver}
                  </td>

                  <td className="px-6 py-5 text-slate-700">
                    {bus.route}
                  </td>

                  <td className="px-6 py-5">
                    <button
                      onClick={() => toggleStatus(bus.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        bus.status === "Running"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      ● {bus.status}
                    </button>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`font-semibold ${
                        bus.gps === "Active"
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      {bus.gps}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <button
                      onClick={() => deleteBus(bus.id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {buses.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No buses registered yet.
          </div>
        )}
      </div>

      {/* Add Bus Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#005BAC]">
                  Add New Bus
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter bus information below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bus Number e.g. AJU Bus 02"
                value={form.busNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    busNumber: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC]"
              />

              <input
                type="text"
                placeholder="Driver Name"
                value={form.driver}
                onChange={(e) =>
                  setForm({
                    ...form,
                    driver: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC]"
              />

              <input
                type="text"
                placeholder="Route Name"
                value={form.route}
                onChange={(e) =>
                  setForm({
                    ...form,
                    route: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC]"
              />

              <button
                onClick={addBus}
                className="w-full rounded-xl bg-[#005BAC] px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Add Bus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}