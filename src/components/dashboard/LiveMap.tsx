"use client";

import dynamic from "next/dynamic";

const LiveMapInner = dynamic(
  () => import("./LiveMapInner"),
  {
    ssr: false,

    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
          <p className="font-semibold text-[#005BAC]">
            Loading live map...
          </p>
        </div>
      </div>
    ),
  }
);

export default function LiveMap() {
  return (
    <div className="h-full w-full">
      <LiveMapInner />
    </div>
  );
}