"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GpsTracker() {
  const [tracking, setTracking] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [message, setMessage] = useState(
    "GPS tracking is currently stopped."
  );

  const watchId = useRef<number | null>(null);

  async function getBus() {
    const { data, error } = await supabase
      .from("buses")
      .select("id, bus_number")
      .limit(1)
      .single();

    if (error) {
      console.error("Bus loading error:", error);
      return null;
    }

    return data;
  }

  async function saveLocation(
    lat: number,
    lng: number
  ) {
    const bus = await getBus();

    if (!bus) {
      setMessage("No bus found.");
      return;
    }

    const { data: existing } = await supabase
      .from("live_locations")
      .select("id")
      .eq("bus_id", bus.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("live_locations")
        .update({
          latitude: lat,
          longitude: lng,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        console.error("GPS update error:", error);
      }
    } else {
      const { error } = await supabase
        .from("live_locations")
        .insert({
          bus_id: bus.id,
          latitude: lat,
          longitude: lng,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error("GPS insert error:", error);
      }
    }

    setLatitude(lat);
    setLongitude(lng);
    setMessage("GPS location is being shared live.");
  }

  function startGPS() {
    if (!navigator.geolocation) {
      setMessage("GPS is not supported by this browser.");
      return;
    }

    setMessage("Requesting GPS permission...");

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await saveLocation(lat, lng);

        setTracking(true);
      },
      (error) => {
        console.error("GPS error:", error);

        setTracking(false);

        if (error.code === 1) {
          setMessage(
            "Location permission denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setMessage("GPS location is unavailable.");
        } else {
          setMessage("Unable to get GPS location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    setTracking(true);
  }

  async function stopGPS() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking(false);

    const bus = await getBus();

    if (bus) {
      await supabase
        .from("live_locations")
        .delete()
        .eq("bus_id", bus.id);
    }

    setMessage("GPS tracking stopped.");

    setLatitude(null);
    setLongitude(null);
  }

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wide text-[#005BAC]">
            Live GPS
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-800">
            Bus Location
          </h2>

        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
            tracking
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              tracking
                ? "animate-pulse bg-green-500"
                : "bg-slate-400"
            }`}
          />

          {tracking ? "GPS LIVE" : "GPS OFF"}

        </div>

      </div>

      {/* LOCATION */}

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">

        <p className="text-sm text-slate-500">
          Current Location
        </p>

        {latitude !== null && longitude !== null ? (

          <div className="mt-3 grid grid-cols-2 gap-4">

            <div className="rounded-xl bg-white p-4">

              <p className="text-xs text-slate-400">
                Latitude
              </p>

              <p className="mt-1 font-mono font-bold text-[#005BAC]">
                {latitude.toFixed(6)}
              </p>

            </div>

            <div className="rounded-xl bg-white p-4">

              <p className="text-xs text-slate-400">
                Longitude
              </p>

              <p className="mt-1 font-mono font-bold text-[#005BAC]">
                {longitude.toFixed(6)}
              </p>

            </div>

          </div>

        ) : (

          <p className="mt-2 text-slate-400">
            Location not available yet.
          </p>

        )}

      </div>

      {/* MESSAGE */}

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

        <span>📍</span>

        {message}

      </div>

      {/* BUTTON */}

      {!tracking ? (

        <button
          type="button"
          onClick={startGPS}
          className="mt-6 w-full rounded-2xl bg-[#005BAC] py-4 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700"
        >
          📍 Start GPS
        </button>

      ) : (

        <button
          type="button"
          onClick={stopGPS}
          className="mt-6 w-full rounded-2xl bg-red-500 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-red-600"
        >
          ⛔ Stop GPS
        </button>

      )}

    </div>
  );
}