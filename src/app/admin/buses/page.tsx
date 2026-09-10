"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type Driver = {
  id: string;
  full_name: string;
};

type RouteItem = {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
};

type Bus = {
  id: string;
  bus_number: string;
  driver_id: string | null;
  route_id: string | null;
  capacity: number | null;
  status: string | null;
};

type BusForm = {
  bus_number: string;
  driver_id: string;
  route_id: string;
  capacity: string;
  status: string;
};

const initialForm: BusForm = {
  bus_number: "",
  driver_id: "",
  route_id: "",
  capacity: "",
  status: "Running",
};

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  const [form, setForm] = useState<BusForm>(
    initialForm
  );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // LOAD BUSES
  // =====================================================

  const loadBuses = useCallback(async () => {
    const {
      data,
      error,
    } = await supabase
      .from("buses")
      .select(
        "id,bus_number,driver_id,route_id,capacity,status"
      )
      .order("bus_number", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    setBuses((data ?? []) as Bus[]);
  }, []);

  // =====================================================
  // LOAD DRIVERS
  // =====================================================

  const loadDrivers = useCallback(async () => {
    const {
      data,
      error,
    } = await supabase
      .from("drivers")
      .select("id,full_name")
      .order("full_name", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    setDrivers(
      (data ?? []) as Driver[]
    );
  }, []);

  // =====================================================
  // LOAD ROUTES
  // =====================================================

  const loadRoutes = useCallback(async () => {
    const {
      data,
      error,
    } = await supabase
      .from("routes")
      .select(
        "id,route_name,start_point,end_point"
      )
      .order("route_name", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    setRoutes(
      (data ?? []) as RouteItem[]
    );
  }, []);

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadBuses(),
        loadDrivers(),
        loadRoutes(),
      ]);
    } catch (err) {
      console.error(
        "Bus page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load bus data."
      );
    } finally {
      setLoading(false);
    }
  }, [
    loadBuses,
    loadDrivers,
    loadRoutes,
  ]);

  // =====================================================
  // INITIAL LOAD + REALTIME
  // =====================================================

  useEffect(() => {
    loadAll();

    const busChannel = supabase
      .channel("admin-bus-data")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "buses",
        },
        loadAll
      )
      .subscribe();

    const driverChannel = supabase
      .channel("admin-bus-driver-data")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "drivers",
        },
        loadAll
      )
      .subscribe();

    const routeChannel = supabase
      .channel("admin-bus-route-data")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "routes",
        },
        loadAll
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        busChannel
      );
      supabase.removeChannel(
        driverChannel
      );
      supabase.removeChannel(
        routeChannel
      );
    };
  }, [loadAll]);

  // =====================================================
  // UPDATE FORM
  // =====================================================

  function updateForm(
    field: keyof BusForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  // =====================================================
  // SAVE BUS
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.bus_number.trim()) {
      setError(
        "Please enter a bus number."
      );
      return;
    }

    const capacity =
      Number(form.capacity);

    if (
      !form.capacity.trim() ||
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      setError(
        "Please enter a valid capacity."
      );
      return;
    }

    setSaving(true);

    try {
      // Check duplicate bus number
      const {
        data: existing,
        error: duplicateError,
      } = await supabase
        .from("buses")
        .select("id,bus_number")
        .eq(
          "bus_number",
          form.bus_number.trim()
        )
        .maybeSingle();

      if (duplicateError) {
        throw new Error(
          duplicateError.message
        );
      }

      if (
        existing &&
        String(existing.id) !==
          String(editingId)
      ) {
        throw new Error(
          `Bus number "${form.bus_number.trim()}" already exists.`
        );
      }

      const busData = {
        bus_number:
          form.bus_number.trim(),

        driver_id:
          form.driver_id || null,

        route_id:
          form.route_id || null,

        capacity,

        status:
          form.status,
      };

      if (editingId) {
        const {
          error: updateError,
        } = await supabase
          .from("buses")
          .update(busData)
          .eq("id", editingId);

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }

        setSuccess(
          "Bus updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("buses")
          .insert(busData);

        if (insertError) {
          throw new Error(
            insertError.message
          );
        }

        setSuccess(
          "Bus added successfully."
        );
      }

      setForm(initialForm);
      setEditingId(null);

      await loadAll();
    } catch (err) {
      console.error(
        "Bus save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save bus."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // EDIT
  // =====================================================

  function handleEdit(bus: Bus) {
    setEditingId(bus.id);

    setForm({
      bus_number: bus.bus_number,
      driver_id: bus.driver_id ?? "",
      route_id: bus.route_id ?? "",
      capacity:
        bus.capacity !== null
          ? String(bus.capacity)
          : "",
      status:
        bus.status ?? "Running",
    });

    setError("");
    setSuccess("");
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this bus?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const {
        error: deleteError,
      } = await supabase
        .from("buses")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      setSuccess(
        "Bus deleted successfully."
      );

      await loadAll();
    } catch (err) {
      console.error(
        "Bus delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete bus."
      );
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  function getDriverName(
    driverId: string | null
  ) {
    return (
      drivers.find(
        (driver) =>
          String(driver.id) ===
          String(driverId)
      )?.full_name ??
      "No driver assigned"
    );
  }

  function getRouteName(
    routeId: string | null
  ) {
    return (
      routes.find(
        (route) =>
          String(route.id) ===
          String(routeId)
      )?.route_name ??
      "No route assigned"
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setSuccess("");
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-6 lg:p-8">

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          AJU SMART BUS
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-900">
          Buses
        </h1>

        <p className="mt-2 text-slate-500">
          Manage buses, drivers and route assignments.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-semibold text-green-700">
          ✅ {success}
        </div>
      )}

      {/* FORM */}

      <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

        <h2 className="text-2xl font-black text-slate-900">
          {editingId
            ? "Edit Bus"
            : "Add Bus"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        >

          <input
            type="text"
            placeholder="Bus Number"
            value={form.bus_number}
            onChange={(e) =>
              updateForm(
                "bus_number",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) =>
              updateForm(
                "capacity",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={form.driver_id}
            onChange={(e) =>
              updateForm(
                "driver_id",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              Select Driver
            </option>

            {drivers.map((driver) => (
              <option
                key={driver.id}
                value={driver.id}
              >
                {driver.full_name}
              </option>
            ))}
          </select>

          <select
            value={form.route_id}
            onChange={(e) =>
              updateForm(
                "route_id",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">
              Select Route
            </option>

            {routes.map((route) => (
              <option
                key={route.id}
                value={route.id}
              >
                {route.route_name}
              </option>
            ))}
          </select>

          <select
            value={form.status}
            onChange={(e) =>
              updateForm(
                "status",
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="Running">
              Running
            </option>

            <option value="Stopped">
              Stopped
            </option>

            <option value="Maintenance">
              Maintenance
            </option>
          </select>

          <div className="flex gap-3">

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#005BAC] px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Bus"
                  : "Add Bus"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
              >
                Cancel
              </button>
            )}

          </div>

        </form>
      </section>

      {/* BUS TABLE */}

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Registered Buses
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {buses.length} buses
            </p>
          </div>

          <button
            type="button"
            onClick={loadAll}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
          >
            ↻ Refresh
          </button>

        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Loading buses...
          </div>
        ) : buses.length === 0 ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-10 text-center">
            <div className="text-5xl">
              🚌
            </div>

            <p className="mt-3 font-bold">
              No buses found
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">

                  <th className="px-4 py-4">
                    Bus
                  </th>

                  <th className="px-4 py-4">
                    Driver
                  </th>

                  <th className="px-4 py-4">
                    Route
                  </th>

                  <th className="px-4 py-4">
                    Capacity
                  </th>

                  <th className="px-4 py-4">
                    Status
                  </th>

                  <th className="px-4 py-4 text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {buses.map((bus) => (
                  <tr
                    key={bus.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-4 py-4 font-bold text-slate-800">
                      🚌 {bus.bus_number}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      👨‍✈️{" "}
                      {getDriverName(
                        bus.driver_id
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      🗺️{" "}
                      {getRouteName(
                        bus.route_id
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold">
                      {bus.capacity ?? "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {bus.status ?? "Unknown"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(bus)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              bus.id
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
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
        )}

      </section>

    </main>
  );
}