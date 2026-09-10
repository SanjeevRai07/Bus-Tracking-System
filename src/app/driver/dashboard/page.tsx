"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
interface Bus {
  id: string;
  bus_number: string;
  driver_id: string | null;
  route_id: string | null;
  capacity: number | null;
  status: string | null;
}

export default function DriverDashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [bus, setBus] = useState<Bus | null>(null);

  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const watchIdRef = useRef<number | null>(null);

  // --------------------------------------------------
  // CHECK LOGIN + LOAD BUS
  // --------------------------------------------------

  useEffect(() => {
    let mounted = true;

    async function loadDriver() {
      try {
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          router.replace("/driver/login");
          return;
        }

        if (!user.email) {
          throw new Error(
            "Driver email is not available."
          );
        }

        if (mounted) {
          setEmail(user.email);
        }

        /*
         * 1. Find the logged-in driver profile.
         */
        const {
          data: driverProfile,
          error: driverError,
        } = await supabase
          .from("drivers")
          .select("id,full_name,email")
          .eq("email", user.email)
          .maybeSingle();

        if (driverError) {
          throw driverError;
        }

        if (!driverProfile) {
          throw new Error(
            "No driver profile is linked to this login email."
          );
        }

        /*
         * 2. Find the bus assigned to this driver.
         */
        const {
          data: assignedBus,
          error: busError,
        } = await supabase
          .from("buses")
          .select(
            "id,bus_number,driver_id,route_id,capacity,status"
          )
          .eq("driver_id", driverProfile.id)
          .maybeSingle();

        if (busError) {
          throw busError;
        }

        if (!assignedBus) {
          throw new Error(
            "No bus is assigned to this driver."
          );
        }

        if (mounted) {
          setBus(assignedBus as Bus);
        }
      } catch (err) {
        console.error(
          "Driver dashboard loading error:",
          err
        );

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load driver information."
          );
        }
      }
    }

    loadDriver();

    return () => {
      mounted = false;

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
        watchIdRef.current = null;
      }
    };
  }, [router]);
  // --------------------------------------------------
  // SAVE LOCATION TO SUPABASE
  // --------------------------------------------------

  async function saveLocation(
    lat: number,
    lng: number
  ) {
    if (!bus) {
      setError(
        "No bus is assigned to this driver."
      );
      return false;
    }

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      setError(
        "Invalid GPS coordinates received."
      );
      return false;
    }

    const timestamp =
      new Date().toISOString();

    /*
     * Primary write.
     */
    const { error: upsertError } =
      await supabase
        .from("live_locations")
        .upsert(
          {
            bus_id: bus.id,
            latitude: lat,
            longitude: lng,
            updated_at: timestamp,
          },
          {
            onConflict: "bus_id",
          }
        );

    /*
     * Fallback for an older DB where bus_id is not unique.
     */
    if (upsertError) {
      console.warn(
        "live_locations upsert failed; using update/insert fallback:",
        upsertError
      );

      const {
        data: existingLocation,
        error: lookupError,
      } = await supabase
        .from("live_locations")
        .select("bus_id")
        .eq("bus_id", bus.id)
        .maybeSingle();

      if (lookupError) {
        setError(
          `GPS database error: ${lookupError.message}`
        );
        return false;
      }

      if (existingLocation) {
        const { error: updateError } =
          await supabase
            .from("live_locations")
            .update({
              latitude: lat,
              longitude: lng,
              updated_at: timestamp,
            })
            .eq("bus_id", bus.id);

        if (updateError) {
          setError(
            `GPS update error: ${updateError.message}`
          );
          return false;
        }
      } else {
        const { error: insertError } =
          await supabase
            .from("live_locations")
            .insert({
              bus_id: bus.id,
              latitude: lat,
              longitude: lng,
              updated_at: timestamp,
            });

        if (insertError) {
          setError(
            `GPS insert error: ${insertError.message}`
          );
          return false;
        }
      }
    }

    /*
     * Verify the row from the same authenticated session.
     * This is the key diagnostic/fix:
     * if the driver can write but cannot read the row,
     * the remote dashboards cannot read it either.
     */
    const {
      data: savedLocation,
      error: verifyError,
    } = await supabase
      .from("live_locations")
      .select(
        "bus_id,latitude,longitude,updated_at"
      )
      .eq("bus_id", bus.id)
      .maybeSingle();

    if (verifyError) {
      setError(
        `GPS verification error: ${verifyError.message}`
      );
      return false;
    }

    if (!savedLocation) {
      setError(
        "GPS was sent but the live_locations row is not readable. Run the live_locations RLS SQL provided below."
      );
      return false;
    }

    setLatitude(
      Number(savedLocation.latitude)
    );
    setLongitude(
      Number(savedLocation.longitude)
    );

    setGpsActive(true);
    setGpsLoading(false);

    setMessage(
      "Live GPS location is being shared with Admin and Students."
    );

    setError("");

    return true;
  }
  // --------------------------------------------------
  // START GPS
  // --------------------------------------------------

  function startGPS() {
    setError("");
    setMessage("");

    if (!bus) {
      setError(
        "Bus information is not loaded yet."
      );
      return;
    }

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setGpsLoading(true);

    /*
     * Get a location immediately so Admin/Student
     * do not have to wait for the first watch event.
     */
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const saved = await saveLocation(
          position.coords.latitude,
          position.coords.longitude
        );

        if (!saved) {
          setGpsLoading(false);
          return;
        }

        /*
         * Continue streaming location updates.
         */
        watchIdRef.current =
          navigator.geolocation.watchPosition(
            async (nextPosition) => {
              await saveLocation(
                nextPosition.coords.latitude,
                nextPosition.coords.longitude
              );
            },
            (geoError) => {
              console.error(
                "GPS watch error:",
                geoError
              );

              setGpsLoading(false);
              setGpsActive(false);

              if (geoError.code === 1) {
                setError(
                  "Location permission denied. Please allow location access."
                );
              } else if (geoError.code === 2) {
                setError(
                  "Your current location could not be detected."
                );
              } else if (geoError.code === 3) {
                setError(
                  "GPS request timed out."
                );
              } else {
                setError(
                  "Unable to access GPS."
                );
              }
            },
            {
              enableHighAccuracy: true,
              maximumAge: 5000,
              timeout: 15000,
            }
          );
      },
      (geoError) => {
        console.error(
          "Initial GPS error:",
          geoError
        );

        setGpsLoading(false);
        setGpsActive(false);

        if (geoError.code === 1) {
          setError(
            "Location permission denied. Please allow location access."
          );
        } else if (geoError.code === 2) {
          setError(
            "Your current location could not be detected."
          );
        } else if (geoError.code === 3) {
          setError(
            "GPS request timed out."
          );
        } else {
          setError(
            "Unable to access GPS."
          );
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  }
  // --------------------------------------------------
  // STOP GPS
  // --------------------------------------------------

  async function stopGPS() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );

      watchIdRef.current = null;
    }

    if (bus) {
      const {
        error: deleteError,
      } = await supabase
        .from("live_locations")
        .delete()
        .eq("bus_id", bus.id);

      if (deleteError) {
        console.error(
          "Could not remove remote live location:",
          deleteError
        );
      }
    }

    setGpsActive(false);
    setGpsLoading(false);

    setLatitude(null);
    setLongitude(null);

    setMessage(
      "GPS sharing stopped."
    );
  }
  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  async function handleLogout() {
    stopGPS();

    await supabase.auth.signOut();

    router.replace("/driver/login");
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (!bus && !error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 shadow-lg">
          <p className="font-semibold text-[#005BAC]">
            Loading driver dashboard...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}
      <header className="bg-[#005BAC] px-6 py-5 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              AJU Smart Bus
            </h1>

            <p className="text-sm text-blue-100">
              Driver Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-white px-6 py-3 font-semibold text-[#005BAC] shadow transition hover:bg-blue-50"
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* WELCOME */}
        <section className="rounded-2xl bg-white p-7 shadow-sm">

          <p className="text-sm font-semibold text-[#005BAC]">
            DRIVER ACCOUNT
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            Welcome, Driver 👋
          </h2>

          <p className="mt-2 text-slate-500">
            {email}
          </p>

        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 font-medium text-red-600">
            ⚠️ {error}
          </div>
        )}

        {/* SUCCESS */}
        {message && !error && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-5 py-4 font-medium text-green-700">
            ✓ {message}
          </div>
        )}

        {/* CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* MY BUS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🚌
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#005BAC]">
              My Bus
            </h3>

            <p className="mt-2 text-lg font-semibold text-slate-700">
              {bus?.bus_number ?? "No Bus"}
            </p>

            <p className="mt-1 text-slate-500">
              {bus?.route_id ? "Assigned Route" : "Route not assigned"}
            </p>

            <div className="mt-5">
              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                ● {bus?.status ?? "Active"}
              </span>
            </div>

          </div>

          {/* LIVE GPS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-3xl">
                📍
              </div>

              {gpsActive && (
                <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
                  LIVE
                </span>
              )}

            </div>

            <h3 className="mt-5 text-xl font-bold text-[#005BAC]">
              Live GPS
            </h3>

            <p className="mt-2 text-slate-500">
              Share your live bus location with students and admin.
            </p>

            {!gpsActive ? (
              <button
                onClick={startGPS}
                disabled={gpsLoading}
                className="mt-5 w-full rounded-xl bg-[#005BAC] px-5 py-3.5 font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {gpsLoading ? "Starting GPS..." : "📍 Start GPS"}
              </button>
            ) : (
              <button
                onClick={stopGPS}
                className="mt-5 w-full rounded-xl bg-red-500 px-5 py-3.5 font-bold text-white shadow transition hover:bg-red-600"
              >
                ⛔ Stop GPS
              </button>
            )}

          </div>

          {/* ROUTE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl">
              🗺️
            </div>

            <h3 className="mt-5 text-xl font-bold text-[#005BAC]">
              My Route
            </h3>

            <p className="mt-2 text-lg font-semibold text-slate-700">
              {bus?.route_id ? "Assigned Route" : "AJU Route"}
            </p>

            <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3">
              <p className="text-sm font-semibold text-[#005BAC]">
                University Bus Route
              </p>
            </div>

          </div>

        </div>

        {/* GPS DETAILS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h3 className="text-xl font-bold text-slate-800">
            GPS Information
          </h3>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                GPS Status
              </p>

              <p
                className={`mt-2 text-lg font-bold ${
                  gpsActive
                    ? "text-green-600"
                    : "text-slate-600"
                }`}
              >
                {gpsActive ? "● Live" : "○ Offline"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Latitude
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {latitude !== null
                  ? latitude.toFixed(6)
                  : "--"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Longitude
              </p>

              <p className="mt-2 font-bold text-slate-700">
                {longitude !== null
                  ? longitude.toFixed(6)
                  : "--"}
              </p>
            </div>

          </div>

        </section>

        {/* TRIP STATUS */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Trip Status
              </h3>

              <p className="mt-1 text-slate-500">
                Current status of your bus trip.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-5 py-2 font-semibold ${
                gpsActive
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {gpsActive ? "GPS Active" : "Ready"}
            </span>

          </div>

        </section>

      </div>
    </main>
  );
}