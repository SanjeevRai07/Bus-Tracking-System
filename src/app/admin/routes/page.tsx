"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type RouteItem = {
  id: string;
  route_name: string;
  start_point: string;
  end_point: string;
};

type RouteForm = {
  route_name: string;
  start_point: string;
  end_point: string;
};

const emptyForm: RouteForm = {
  route_name: "",
  start_point: "",
  end_point: "",
};

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteItem[]>(
    []
  );

  const [form, setForm] =
    useState<RouteForm>(emptyForm);

  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD ROUTES
  // =====================================================

  const loadRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data,
        error: loadError,
      } = await supabase
        .from("routes")
        .select(
          "id,route_name,start_point,end_point"
        )
        .order("route_name", {
          ascending: true,
        });

      if (loadError) {
        console.error(
          "Route loading error:",
          loadError
        );

        throw new Error(
          loadError.message ||
            "Unable to load routes."
        );
      }

      setRoutes((data ?? []) as RouteItem[]);
    } catch (err) {
      console.error(
        "Routes page error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load routes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD + REALTIME
  // =====================================================

  useEffect(() => {
    loadRoutes();

    const channel = supabase
      .channel("admin-routes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "routes",
        },
        () => {
          loadRoutes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRoutes]);

  // =====================================================
  // ADD / UPDATE
  // =====================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.route_name.trim()) {
      setError("Please enter route name.");
      return;
    }

    if (!form.start_point.trim()) {
      setError(
        "Please enter starting point."
      );
      return;
    }

    if (!form.end_point.trim()) {
      setError(
        "Please enter destination."
      );
      return;
    }

    setSaving(true);

    try {
      const routeData = {
        route_name:
          form.route_name.trim(),

        start_point:
          form.start_point.trim(),

        end_point:
          form.end_point.trim(),
      };

      if (editingId) {
        const {
          error: updateError,
        } = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", editingId);

        if (updateError) {
          throw new Error(
            updateError.message
          );
        }

        setSuccess(
          "Route updated successfully."
        );
      } else {
        const {
          error: insertError,
        } = await supabase
          .from("routes")
          .insert(routeData);

        if (insertError) {
          throw new Error(
            insertError.message
          );
        }

        setSuccess(
          "Route added successfully."
        );
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadRoutes();
    } catch (err) {
      console.error(
        "Route save error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save route."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // EDIT
  // =====================================================

  function handleEdit(route: RouteItem) {
    setEditingId(route.id);

    setForm({
      route_name: route.route_name,
      start_point: route.start_point,
      end_point: route.end_point,
    });

    setError("");
    setSuccess("");
  }

  // =====================================================
  // DELETE
  // =====================================================

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this route?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const {
        error: deleteError,
      } = await supabase
        .from("routes")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(
          deleteError.message
        );
      }

      setSuccess(
        "Route deleted successfully."
      );

      await loadRoutes();
    } catch (err) {
      console.error(
        "Route delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete route."
      );
    }
  }

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-6 lg:p-8">

      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
          AJU Smart Bus
        </p>

        <h1 className="mt-2 text-4xl font-black text-slate-900">
          Routes
        </h1>

        <p className="mt-2 text-slate-500">
          Create and manage university bus routes.
        </p>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          ✅ {success}
        </div>
      )}

      {/* FORM */}

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-black text-slate-900">
              {editingId
                ? "Edit Route"
                : "Add Route"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter route information.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >

          <input
            type="text"
            placeholder="Route Name"
            value={form.route_name}
            onChange={(e) =>
              setForm({
                ...form,
                route_name:
                  e.target.value,
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Starting Point"
            value={form.start_point}
            onChange={(e) =>
              setForm({
                ...form,
                start_point:
                  e.target.value,
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Destination"
            value={form.end_point}
            onChange={(e) =>
              setForm({
                ...form,
                end_point:
                  e.target.value,
              })
            }
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#005BAC] px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50 md:col-span-3"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update Route"
                : "Add Route"}
          </button>

        </form>

      </section>

      {/* ROUTE LIST */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-black text-slate-900">
              Registered Routes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {routes.length} route
              {routes.length === 1 ? "" : "s"} found
            </p>
          </div>

          <button
            type="button"
            onClick={loadRoutes}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            ↻ Refresh
          </button>

        </div>

        <div className="mt-6 overflow-x-auto">

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading routes...
            </div>
          ) : routes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

              <div className="text-4xl">
                🗺️
              </div>

              <h3 className="mt-3 font-bold text-slate-700">
                No routes found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first route above.
              </p>

            </div>
          ) : (
            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">

                  <th className="px-4 py-4">
                    Route
                  </th>

                  <th className="px-4 py-4">
                    Start
                  </th>

                  <th className="px-4 py-4">
                    Destination
                  </th>

                  <th className="px-4 py-4 text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {routes.map((route) => (
                  <tr
                    key={route.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                          🗺️
                        </div>

                        <span className="font-bold text-slate-800">
                          {route.route_name}
                        </span>

                      </div>

                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {route.start_point}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {route.end_point}
                    </td>

                    <td className="px-4 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(route)
                          }
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              route.id
                            )
                          }
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          )}

        </div>

      </section>

    </main>
  );
}