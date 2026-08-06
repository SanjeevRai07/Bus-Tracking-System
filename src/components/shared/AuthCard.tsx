"use client";

import { BusFront } from "lucide-react";

type AuthCardProps = {
  title: string;
  subtitle: string;
};

export default function AuthCard({
  title,
  subtitle,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <div className="mb-8 flex justify-center">
        <div className="rounded-2xl bg-[#005BAC] p-4 text-white">
          <BusFront size={40} />
        </div>
      </div>

      <h1 className="text-center text-3xl font-bold text-[#005BAC]">
        {title}
      </h1>

      <p className="mt-2 text-center text-gray-500">
        {subtitle}
      </p>

      <form className="mt-8 space-y-5">
        <input
          type="email"
          placeholder="University Email"
          className="w-full rounded-xl border p-4 outline-none focus:border-[#005BAC]"
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-xl border p-4 outline-none focus:border-[#005BAC]"
        />

        <button
          className="w-full rounded-xl bg-[#005BAC] py-4 font-semibold text-white transition hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}