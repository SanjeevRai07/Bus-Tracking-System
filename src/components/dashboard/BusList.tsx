"use client";

import { useEffect, useState } from "react";
import { BusFront } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Bus {
  id: string;
  bus_number: string;
  driver_name: string | null;
  route: string | null;
  status: string;
}

export default function BusList() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBuses() {
    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .order("bus_number", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setBuses(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBuses();

    const channel = supabase
      .channel("bus-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "buses",
        },
        () => {
          fetchBuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-10 rounded-xl bg-white p-6 shadow">
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-xl bg-white p-6 shadow">
      <h2 className="mb-6 text-2xl font-bold text-[#005BAC]">
        Running Buses
      </h2>

      {buses.length === 0 ? (
        <p>No buses found.</p>
      ) : (
        <div className="space-y-4">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <BusFront className="text-[#005BAC]" />
                </div>

                <div>
                  <h3 className="font-bold">{bus.bus_number}</h3>
                  <p className="text-sm text-gray-500">
                    {bus.driver_name || "No Driver"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {bus.route || "No Route"}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  bus.status === "Running"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {bus.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}