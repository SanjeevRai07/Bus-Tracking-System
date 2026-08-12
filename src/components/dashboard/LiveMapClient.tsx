"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(
  () => import("./LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[550px] items-center justify-center bg-slate-100">
        <p className="text-lg text-slate-500">
          Loading map...
        </p>
      </div>
    ),
  }
);

export default function LiveMapClient() {
  return <LiveMap />;
}