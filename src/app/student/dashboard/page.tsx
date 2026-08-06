import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import StatsCard from "@/components/dashboard/StatsCard";
import dynamic from "next/dynamic";
import BusList from "@/components/dashboard/BusList";
const LiveMap = dynamic(
  () => import("@/components/dashboard/LiveMap"),
  { ssr: false }
);

export default function StudentDashboard() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 bg-slate-100 min-h-screen">
        <Topbar />

        <div className="p-8">
          <h2 className="text-3xl font-bold">
            Welcome to AJU Smart Bus Tracking
          </h2>

          <p className="mt-3 text-gray-600">
            Track your university buses in real-time.
          </p>

          <div className="mt-8">
            <StatsCard />
          </div>

          {/* 👇 YAHAN ADD KARNA HAI */}
          <div className="mt-10">
            <LiveMap />
          </div>
           <div className="mt-10">
    <BusList />
  </div>

        </div>
      </main>
    </div>
  );
}