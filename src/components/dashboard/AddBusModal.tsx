"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddBusModal() {
  const [open, setOpen] = useState(false);
  const [busNumber, setBusNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [route, setRoute] = useState("");

  async function handleSave() {
    const { error } = await supabase.from("buses").insert({
      bus_number: busNumber,
      driver_name: driverName,
      route: route,
      status: "Running",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Bus Added Successfully!");

    setBusNumber("");
    setDriverName("");
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="w-[400px] rounded-xl bg-white p-6">
            <h2 className="text-2xl font-bold">Add Bus</h2>

            <input
              type="text"
              placeholder="Bus Number"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
              className="mt-5 w-full rounded-lg border p-3"
            />

            <input
              type="text"
              placeholder="Driver Name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="mt-4 w-full rounded-lg border p-3"
            />

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
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-[#005BAC] px-5 py-2 text-white"
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