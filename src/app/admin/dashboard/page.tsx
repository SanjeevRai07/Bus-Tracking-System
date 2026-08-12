import LiveMap from "@/components/dashboard/LiveMap";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen w-full bg-slate-100 px-6 py-8 lg:px-8">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#005BAC]">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-lg text-slate-600">
          Manage buses, drivers, routes and students.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Total Buses
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
            1
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Registered buses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Buses
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-600">
            1
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Currently running
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Drivers
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
            1
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Registered drivers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Routes
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
            1
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Active routes
          </p>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* LIVE MAP */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* MAP HEADER */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>
              <h2 className="text-2xl font-bold text-[#005BAC]">
                Live Bus Tracking
              </h2>

              <p className="mt-1 text-slate-500">
                Track university buses in real time
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
              Live
            </div>

          </div>

          {/* MAP */}
          <div className="h-[500px] w-full">
            <LiveMap />
          </div>

        </div>

        {/* ACTIVE BUSES */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold text-[#005BAC]">
                Active Buses
              </h2>

              <p className="mt-1 text-slate-500">
                Currently online
              </p>
            </div>

            <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              1 Live
            </span>

          </div>

          {/* BUS CARD */}
          <div className="mt-6 rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-3xl">
                🚌
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  AJU Bus 01
                </h3>

                <p className="text-slate-500">
                  Sanjeev Kumar Rai
                </p>
              </div>

            </div>

            {/* BUS DETAILS */}
            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  Status
                </span>

                <span className="font-semibold text-green-600">
                  ● Running
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  Route
                </span>

                <span className="font-semibold text-slate-700">
                  AJU Route
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  GPS
                </span>

                <span className="font-semibold text-blue-600">
                  Active
                </span>
              </div>

            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#005BAC] px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              View Bus Details
            </button>

          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-7">

            <h3 className="text-lg font-bold text-slate-800">
              Quick Actions
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <button
                type="button"
                className="rounded-xl bg-blue-50 p-4 text-center font-semibold text-[#005BAC] transition hover:bg-blue-100"
              >
                🚌
                <br />
                Manage Buses
              </button>

              <button
                type="button"
                className="rounded-xl bg-blue-50 p-4 text-center font-semibold text-[#005BAC] transition hover:bg-blue-100"
              >
                👨‍✈️
                <br />
                Drivers
              </button>

              <button
                type="button"
                className="rounded-xl bg-blue-50 p-4 text-center font-semibold text-[#005BAC] transition hover:bg-blue-100"
              >
                🗺️
                <br />
                Routes
              </button>

              <button
                type="button"
                className="rounded-xl bg-blue-50 p-4 text-center font-semibold text-[#005BAC] transition hover:bg-blue-100"
              >
                🎓
                <br />
                Students
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}