"use client";

import AdminSidebar from "@/components/dashboard/AdminSidebar";
import LiveMap from "@/components/dashboard/LiveMap";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Fixed Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-72 min-h-screen p-8">

        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#005BAC]">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-lg text-slate-600">
            Manage buses, drivers, routes and students.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Total Buses */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm font-medium text-slate-500">
              Total Buses
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
              1
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registered buses
            </p>
          </div>

          {/* Active Buses */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm font-medium text-slate-500">
              Active Buses
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              1
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Currently running
            </p>
          </div>

          {/* Drivers */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm font-medium text-slate-500">
              Drivers
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
              1
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registered drivers
            </p>
          </div>

        </div>

        {/* Live Bus Tracking */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-lg">

          {/* Map Header */}
          <div className="flex items-center justify-between border-b px-6 py-5">

            <div>
              <h2 className="text-2xl font-bold text-[#005BAC]">
                Live Bus Tracking
              </h2>

              <p className="mt-1 text-slate-500">
                Track university buses in real time
              </p>
            </div>

            {/* Live Status */}
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              <span className="h-3 w-3 rounded-full bg-green-500"></span>
              Live
            </div>

          </div>

          {/* Map */}
          <div className="w-full">
            <LiveMap />
          </div>

        </section>

      </main>
    </div>
  );
}