"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, BusFront } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Bus {
  id: string;
  bus_number: string;
  driver_name: string | null;
}

export default function DriverLocationPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState("");
  const [tracking, setTracking] = useState(false);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [message, setMessage] = useState(
    "Select your bus to start tracking."
  );

  const [watchId, setWatchId] = useState<number | null>(null);

  // Fetch buses
  useEffect(() => {
    async function fetchBuses() {
      const { data, error } = await supabase
        .from("buses")
        .select("id, bus_number, driver_name")
        .order("bus_number", { ascending: true });

      if (error) {
        console.error("Bus fetch error:", error.message);
        setMessage(error.message);
        return;
      }

      setBuses(data || []);
    }

    fetchBuses();
  }, []);

  // Save GPS location
  async function saveLocation(lat: number, lng: number) {
    if (!selectedBus) return;

    const { data: existingLocation, error: findError } =
      await supabase
        .from("live_locations")
        .select("id")
        .eq("bus_id", selectedBus)
        .maybeSingle();

    if (findError) {
      console.error(findError.message);
      setMessage(findError.message);
      return;
    }

    if (existingLocation) {
      const { error } = await supabase
        .from("live_locations")
        .update({
          latitude: lat,
          longitude: lng,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLocation.id);

      if (error) {
        console.error(error.message);
        setMessage(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("live_locations")
        .insert({
          bus_id: selectedBus,
          latitude: lat,
          longitude: lng,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error(error.message);
        setMessage(error.message);
        return;
      }
    }

    setLatitude(lat);
    setLongitude(lng);

    setMessage("Location updated successfully.");
  }

  // Start GPS tracking
  function startTracking() {
    if (!selectedBus) {
      alert("Please select a bus first.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setMessage("Getting your location...");
    setTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        await saveLocation(lat, lng);
      },
      (error) => {
        console.error(error);

        setTracking(false);

        if (error.code === 1) {
          setMessage(
            "Location permission denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setMessage("Unable to get your current location.");
        } else if (error.code === 3) {
          setMessage("Location request timed out.");
        } else {
          setMessage("GPS error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setWatchId(id);
  }

  // Stop GPS tracking
  function stopTracking() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    setTracking(false);
    setMessage("Tracking stopped.");
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#005BAC]">
            Driver GPS Tracking
          </h1>

          <p className="mt-2 text-gray-500">
            Share your live bus location with students.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">

          {/* Bus Selection */}
          <label className="mb-2 block font-semibold text-gray-700">
            Select Bus
          </label>

          <div className="relative">
            <BusFront
              className="absolute left-3 top-3.5 text-[#005BAC]"
              size={22}
            />

            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              disabled={tracking}
              className="w-full rounded-xl border bg-white py-3 pl-11 pr-4 outline-none focus:border-[#005BAC]"
            >
              <option value="">
                Select your bus
              </option>

              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.bus_number}
                  {bus.driver_name
                    ? ` - ${bus.driver_name}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Tracking Status */}
          <div className="mt-6 rounded-xl bg-slate-50 p-5">

            <div className="flex items-center gap-3">
              <div
                className={`rounded-full p-3 ${
                  tracking
                    ? "bg-green-100"
                    : "bg-blue-100"
                }`}
              >
                <Navigation
                  className={
                    tracking
                      ? "text-green-600"
                      : "text-[#005BAC]"
                  }
                />
              </div>

              <div>
                <p className="font-semibold">
                  {tracking
                    ? "GPS Tracking Active"
                    : "GPS Tracking Inactive"}
                </p>

                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          {latitude !== null && longitude !== null && (
            <div className="mt-5 grid grid-cols-2 gap-4">

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">
                  Latitude
                </p>

                <p className="mt-1 font-semibold">
                  {latitude.toFixed(6)}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-gray-500">
                  Longitude
                </p>

                <p className="mt-1 font-semibold">
                  {longitude.toFixed(6)}
                </p>
              </div>

            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-3">

            {!tracking ? (
              <button
                onClick={startTracking}
                className="flex-1 rounded-xl bg-[#005BAC] px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                <span className="flex items-center justify-center gap-2">
                  <MapPin size={20} />
                  Start Tracking
                </span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                Stop Tracking
              </button>
            )}

          </div>
        </div>

        {/* Info */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <h3 className="font-semibold text-[#005BAC]">
            How it works
          </h3>

          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• Select your assigned bus.</li>
            <li>• Click Start Tracking.</li>
            <li>• Allow browser location permission.</li>
            <li>• Your GPS location will be saved automatically.</li>
            <li>• Students will be able to see the bus location.</li>
          </ul>
        </div>

      </div>
    </main>
  );
}