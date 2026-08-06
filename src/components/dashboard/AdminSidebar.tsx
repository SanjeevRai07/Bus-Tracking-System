"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Bus,
  Users,
  Route,
  GraduationCap,
  Settings,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Buses",
    href: "/admin/buses",
    icon: Bus,
  },
  {
    name: "Drivers",
    href: "/admin/drivers",
    icon: Users,
  },
  {
    name: "Routes",
    href: "/admin/routes",
    icon: Route,
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: GraduationCap,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-[#005BAC] text-white p-6">
      <h2 className="text-2xl font-bold mb-8">
        AJU Admin
      </h2>

      <nav className="space-y-4">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-blue-700"
            >
              <Icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}