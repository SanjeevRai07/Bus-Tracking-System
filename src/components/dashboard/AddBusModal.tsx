"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Driver {
  id: string;
  full_name: string;
}

export default function AddBusModal() {
  const [open, setOpen] = useState(false);

  const [busNumber, setBusNumber] = useState("");
  const [driverId, setDriverId] = useState("");
  const [route, setRoute] = useState("");

  const [drivers, setDrivers] = useState<Driver[]>([]);

  async function fetchDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select("id, full_name")
      .order("full_name");

    if (error) {
      console.error(error.message);
      return;
    }

    setDrivers(data || []);
  }

  useEffect(() => {
    if (open) {
      fetchDrivers();
    }
  }, [open]);

  async function handleSave() {
    if (!busNumber || !driverId || !route) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase.from("buses").insert({
      bus_number: busNumber,
      driver_id: driverId,
      driver_name: drivers.find(
        (driver) => String(driver.id) === String(driverId)
      )?.full_name,
      route: route,
      status: "Running",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Bus Added Successfully!");

    setBusNumber("");
    setDriverId("");
    setRoute("");
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[#005BAC] px-6 py-3 text-white hover:bg-blue-700"
      >
        + Add Bus
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#005BAC]">
              Add Bus
            </h2>

            <input
              type="text"
              placeholder="Bus Number"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="mt-5 w-full rounded-lg border p-3"
            />

            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="mt-4 w-full rounded-lg border bg-white p-3"
            >
              <option value="">Select Driver</option>

              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Route"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="mt-4 w-full rounded-lg border p-3"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-5 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-[#005BAC] px-5 py-2 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}