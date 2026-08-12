"use client";

import { useState } from "react";

interface Route {
  id: number;
  name: string;
  start: string;
  destination: string;
  stops: number;
  bus: string;
  status: "Active" | "Inactive";
}

const emptyForm = {
  name: "",
  start: "",
  destination: "",
  stops: "",
  bus: "",
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 1,
      name: "AJU Route",
      start: "Adityapur",
      destination: "ARKA JAIN University",
      stops: 8,
      bus: "AJU Bus 01",
      status: "Active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEditForm(route: Route) {
    setEditingId(route.id);

    setForm({
      name: route.name,
      start: route.start,
      destination: route.destination,
      stops: String(route.stops),
      bus: route.bus,
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function saveRoute() {
    if (
      !form.name.trim() ||
      !form.start.trim() ||
      !form.destination.trim() ||
      !form.stops.trim() ||
      !form.bus.trim()
    ) {
      setError("Please fill all fields before saving.");
      return;
    }

    if (editingId !== null) {
      setRoutes((prev) =>
        prev.map((route) =>
          route.id === editingId
            ? {
                ...route,
                name: form.name,
                start: form.start,
                destination: form.destination,
                stops: Number(form.stops),
                bus: form.bus,
              }
            : route
        )
      );

      closeForm();
      return;
    }

    const newRoute: Route = {
      id: Date.now(),
      name: form.name,
      start: form.start,
      destination: form.destination,
      stops: Number(form.stops),
      bus: form.bus,
      status: "Active",
    };

    setRoutes((prev) => [...prev, newRoute]);
    closeForm();
  }

  function deleteRoute(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this route?"
    );

    if (!confirmed) return;

    setRoutes((prev) =>
      prev.filter((route) => route.id !== id)
    );
  }

  function toggleStatus(id: number) {
    setRoutes((prev) =>
      prev.map((route) =>
        route.id === id
          ? {
              ...route,
              status:
                route.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : route
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">

      {/* HEADER */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#005BAC]">
            Route Management
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            Manage university bus routes and stops.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-xl bg-[#005BAC] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
        >
          + Add New Route
        </button>
      </div>

      {/* STATISTICS */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Routes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
            {routes.length}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Registered routes
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Routes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {
              routes.filter(
                (route) => route.status === "Active"
              ).length
            }
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Currently operating
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Stops
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {routes.reduce(
              (total, route) => total + route.stops,
              0
            )}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Across all routes
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Assigned Buses
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-600">
            {
              routes.filter(
                (route) => route.bus.trim() !== ""
              ).length
            }
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Buses assigned
          </p>
        </div>

      </div>

      {/* ROUTES TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-2xl font-bold text-[#005BAC]">
            All Routes
          </h2>

          <p className="mt-1 text-slate-500">
            View and manage university bus routes.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1000px]">

            <thead className="bg-slate-50">

              <tr className="text-left text-sm text-slate-500">

                <th className="px-6 py-4">
                  Route
                </th>

                <th className="px-6 py-4">
                  Start
                </th>

                <th className="px-6 py-4">
                  Destination
                </th>

                <th className="px-6 py-4">
                  Stops
                </th>

                <th className="px-6 py-4">
                  Bus
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {routes.map((route) => (

                <tr
                  key={route.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50"
                >

                  {/* ROUTE */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                        🗺️
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {route.name}
                        </p>

                        <p className="text-sm text-slate-400">
                          Route #{route.id}
                        </p>
                      </div>

                    </div>

                  </td>

                  {/* START */}

                  <td className="px-6 py-5 text-slate-700">
                    {route.start}
                  </td>

                  {/* DESTINATION */}

                  <td className="px-6 py-5 font-medium text-[#005BAC]">
                    {route.destination}
                  </td>

                  {/* STOPS */}

                  <td className="px-6 py-5">

                    <span className="rounded-lg bg-blue-50 px-3 py-2 font-semibold text-blue-600">
                      {route.stops} Stops
                    </span>

                  </td>

                  {/* BUS */}

                  <td className="px-6 py-5 font-medium text-slate-700">
                    🚌 {route.bus}
                  </td>

                  {/* STATUS */}

                  <td className="px-6 py-5">

                    <button
                      onClick={() =>
                        toggleStatus(route.id)
                      }
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        route.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      ● {route.status}
                    </button>

                  </td>

                  {/* ACTIONS */}

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <button
                        onClick={() =>
                          openEditForm(route)
                        }
                        className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteRoute(route.id)
                        }
                        className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {routes.length === 0 && (
          <div className="px-6 py-12 text-center text-slate-500">
            No routes registered yet.
          </div>
        )}

      </div>

      {/* ADD / EDIT MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">

            <div className="mb-6 flex items-start justify-between">

              <div>

                <h2 className="text-2xl font-bold text-[#005BAC]">
                  {editingId !== null
                    ? "Edit Route"
                    : "Add New Route"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingId !== null
                    ? "Update route information."
                    : "Enter route information below."}
                </p>

              </div>

              <button
                onClick={closeForm}
                className="text-2xl font-semibold text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-4">

              {/* ROUTE NAME */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Route Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. AJU Route"
                  value={form.name}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      name: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* START */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Starting Point
                </label>

                <input
                  type="text"
                  placeholder="e.g. Adityapur"
                  value={form.start}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      start: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DESTINATION */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Destination
                </label>

                <input
                  type="text"
                  placeholder="e.g. ARKA JAIN University"
                  value={form.destination}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      destination: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* STOPS */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Number of Stops
                </label>

                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 8"
                  value={form.stops}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      stops: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BUS */}

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Assigned Bus
                </label>

                <input
                  type="text"
                  placeholder="e.g. AJU Bus 01"
                  value={form.bus}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      bus: e.target.value,
                    });
                    setError("");
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#005BAC] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  onClick={closeForm}
                  className="w-1/3 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveRoute}
                  className="w-2/3 rounded-xl bg-[#005BAC] px-5 py-3 font-semibold text-white shadow-md hover:bg-blue-700"
                >
                  {editingId !== null
                    ? "Save Changes"
                    : "Add Route"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}