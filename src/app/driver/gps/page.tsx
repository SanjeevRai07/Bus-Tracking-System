"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type LocationData = {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
};

export default function DriverGPSPage() {
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  const watchId = useRef<number | null>(null);

  const updateLocation = async (position: GeolocationPosition) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const speed =
      position.coords.speed !== null
        ? Math.max(0, position.coords.speed * 3.6)
        : 0;

    const heading =
      position.coords.heading !== null
        ? position.coords.heading
        : 0;

    const newLocation = {
      latitude,
      longitude,
      speed,
      heading,
    };

    setLocation(newLocation);
    setLastUpdate(new Date().toLocaleTimeString());

    console.log("📍 GPS:", newLocation);

    // Send live location to Supabase
    const { error: supabaseError } = await supabase
      .from("bus_locations")
      .upsert(
        {
          bus_id: "BUS-01",
          latitude,
          longitude,
          speed,
          heading,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "bus_id",
        }
      );

    if (supabaseError) {
      console.error("Supabase Error:", supabaseError);
      setError(`Supabase Error: ${supabaseError.message}`);
    } else {
      console.log("✅ Location saved to Supabase");
      setError("");
    }
  };

  const handleGPSError = (gpsError: GeolocationPositionError) => {
    console.error("GPS Error:", gpsError);

    if (gpsError.code === 1) {
      setError("Location permission denied. Please allow GPS access.");
    } else if (gpsError.code === 2) {
      setError("Unable to get your current location.");
    } else if (gpsError.code === 3) {
      setError("GPS request timed out. Please try again.");
    } else {
      setError("GPS error occurred.");
    }

    setTracking(false);
  };

  const startGPS = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("GPS is not supported on this device.");
      return;
    }

    setTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      updateLocation,
      handleGPSError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  };

  const stopGPS = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking(false);
    console.log("🛑 GPS Tracking stopped");
  };

  // Stop GPS automatically when leaving page
  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-4xl shadow-xl">
            🚌
          </div>

          <h1 className="text-3xl font-bold">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-slate-400">
            Driver Live GPS Tracking
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">

          {/* Status */}
          <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-900 p-4">
            <div>
              <p className="text-sm text-slate-400">
                Bus
              </p>

              <p className="text-xl font-bold">
                BUS-01
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  tracking
                    ? "animate-pulse bg-green-500"
                    : "bg-red-500"
                }`}
              />

              <span className="text-sm font-semibold">
                {tracking ? "GPS LIVE" : "GPS OFF"}
              </span>
            </div>
          </div>

          {/* Buttons */}
          {!tracking ? (
            <button
              onClick={startGPS}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-bold shadow-lg transition hover:bg-blue-700 active:scale-[0.98]"
            >
              📍 Start Live GPS
            </button>
          ) : (
            <button
              onClick={stopGPS}
              className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-bold shadow-lg transition hover:bg-red-700 active:scale-[0.98]"
            >
              ⛔ Stop GPS Tracking
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              ❌ {error}
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Latitude
                </p>

                <p className="mt-2 break-all text-lg font-bold text-blue-400">
                  {location.latitude.toFixed(6)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Longitude
                </p>

                <p className="mt-2 break-all text-lg font-bold text-blue-400">
                  {location.longitude.toFixed(6)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Speed
                </p>

                <p className="mt-2 text-lg font-bold text-green-400">
                  {location.speed.toFixed(1)} km/h
                </p>
              </div>

              <div className="rounded-2xl bg-slate-900 p-5">
                <p className="text-sm text-slate-400">
                  Direction
                </p>

                <p className="mt-2 text-lg font-bold text-yellow-400">
                  {location.heading.toFixed(0)}°
                </p>
              </div>

            </div>
          )}

          {/* Last Update */}
          {lastUpdate && (
            <div className="mt-6 rounded-2xl bg-blue-500/10 p-4 text-center">
              <p className="text-sm text-slate-400">
                Last GPS Update
              </p>

              <p className="mt-1 font-semibold text-blue-300">
                {lastUpdate}
              </p>
            </div>
          )}

        </div>

        {/* Information */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>
            📡 Your phone is being used as the bus GPS device.
          </p>

          <p className="mt-1">
            Keep this page open while driving.
          </p>
        </div>

      </div>
    </main>
  );
}