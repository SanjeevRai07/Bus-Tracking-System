"use client";

import Link from "next/link";
import { Bus, Map, Bell, User } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#005BAC] text-white p-6">
      <h2 className="text-2xl font-bold mb-8">AJU Bus</h2>

      <nav className="space-y-4">
        <Link href="/student/dashboard" className="flex items-center gap-3 hover:text-yellow-300">
          <Bus size={20} />
          Dashboard
        </Link>

        <Link href="#" className="flex items-center gap-3 hover:text-yellow-300">
          <Map size={20} />
          Live Tracking
        </Link>

        <Link href="#" className="flex items-center gap-3 hover:text-yellow-300">
          <Bell size={20} />
          Notifications
        </Link>

        <Link href="#" className="flex items-center gap-3 hover:text-yellow-300">
          <User size={20} />
          Profile
        </Link>
      </nav>
    </aside>
  );
}