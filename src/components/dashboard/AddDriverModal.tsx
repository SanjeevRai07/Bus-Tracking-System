"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddDriverModal() {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  async function addDriver() {
    if (!fullName || !phone || !email) {
      alert("Please fill all fields");
      return;
    }

    const { error } = await supabase.from("drivers").insert({
      full_name: fullName,
      phone: phone,
      email: email,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Driver Added Successfully!");

    setFullName("");
    setPhone("");
    setEmail("");
    setOpen(false);

    window.location.reload();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[#005BAC] px-6 py-3 text-white hover:bg-blue-700"
      >
        + Add Driver
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-[#005BAC]">
              Add Driver
            </h2>

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-5 w-full rounded-lg border p-3"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-4 w-full rounded-lg border p-3"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onClick={addDriver}
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