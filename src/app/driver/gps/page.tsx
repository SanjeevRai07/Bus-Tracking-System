"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DriverGPSPage() {
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const startGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS is not supported on this device.");
      return;
    }

    setTracking(true);

    navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });

        console.log("📍 Live Location:", lat, lng);

        // Send location to Supabase
        const { error } = await supabase
          .from("bus_locations")
          .upsert({
            bus_id: "BUS-01",
            latitude: lat,
            longitude: lng,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Supabase error:", error);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-xl">

        <h1 className="text-3xl font-bold">
          🚌 Driver GPS
        </h1>

        <p className="mt-2 text-slate-400">
          Use your phone as a live GPS device.
        </p>

        <div className="mt-8 rounded-2xl bg-slate-900 p-6">

          <button
            onClick={startGPS}
            disabled={tracking}
            className="w-full rounded-xl bg-blue-600 px-5 py-4 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {tracking ? "🟢 GPS Tracking Active" : "📍 Start GPS"}
          </button>

          {location && (
            <div className="mt-6 rounded-xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">
                Current Location
              </p>

              <p className="mt-2">
                Latitude:{" "}
                <span className="font-bold">
                  {location.lat}
                </span>
              </p>

              <p>
                Longitude:{" "}
                <span className="font-bold">
                  {location.lng}
                </span>
              </p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}