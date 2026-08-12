"use client";

import { useEffect, useState } from "react";
import { Users, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Driver {
  id: string;
  full_name: string;
  phone: string;
  email: string;
}

export default function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  async function fetchDrivers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("drivers")
      .select("id, full_name, phone, email")
      .order("full_name", { ascending: true });

    if (error) {
      console.error(error.message);
    } else {
      setDrivers(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchDrivers();
  }, []);

  // DELETE DRIVER
  async function deleteDriver(id: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this driver?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Driver deleted successfully!");
    fetchDrivers();
  }

  // OPEN EDIT MODAL
  function openEdit(driver: Driver) {
    setEditId(driver.id);
    setEditName(driver.full_name);
    setEditPhone(driver.phone);
    setEditEmail(driver.email);
    setEditOpen(true);
  }

  // UPDATE DRIVER
  async function updateDriver() {
    if (!editName || !editPhone || !editEmail) {
      alert("Please fill all fields.");
      return;
    }

    const { error } = await supabase
      .from("drivers")
      .update({
        full_name: editName,
        phone: editPhone,
        email: editEmail,
      })
      .eq("id", editId);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Driver updated successfully!");

    setEditOpen(false);

    fetchDrivers();
  }

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-lg">
        <p className="text-gray-500">Loading drivers...</p>
      </div>
    );
  }

  return (
    <>
      {/* DRIVER LIST */}
      <div className="mt-10 rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-[#005BAC]">
          Drivers
        </h2>

        {drivers.length === 0 ? (
          <p className="text-gray-500">No drivers found.</p>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                {/* DRIVER INFO */}
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <Users
                      className="text-[#005BAC]"
                      size={24}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {driver.full_name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      Phone: {driver.phone}
                    </p>

                    <p className="text-sm text-gray-500">
                      Email: {driver.email}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    Available
                  </span>

                  {/* EDIT */}
                  <button
                    onClick={() => openEdit(driver)}
                    className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                    title="Edit Driver"
                  >
                    <Pencil size={18} />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteDriver(driver.id)}
                    className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                    title="Delete Driver"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[450px] rounded-2xl bg-white p-6 shadow-2xl">

            <h2 className="mb-6 text-2xl font-bold text-[#005BAC]">
              Edit Driver
            </h2>

            {/* NAME */}
            <input
              type="text"
              placeholder="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-[#005BAC]"
            />

            {/* PHONE */}
            <input
              type="text"
              placeholder="Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="mb-4 w-full rounded-lg border p-3 outline-none focus:border-[#005BAC]"
            />

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="mb-6 w-full rounded-lg border p-3 outline-none focus:border-[#005BAC]"
            />

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border px-5 py-2"
              >
                Cancel
              </button>

              <button
                onClick={updateDriver}
                className="rounded-lg bg-[#005BAC] px-5 py-2 text-white hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}