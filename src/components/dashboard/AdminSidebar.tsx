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
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[334px] flex-col overflow-y-auto bg-[#005BAC] px-6 py-8 text-white">

      {/* LOGO */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold">
          AJU Admin
        </h1>

        <p className="mt-2 text-blue-100">
          Smart Bus Management
        </p>
      </div>

      {/* NAVIGATION */}
      <nav className="flex flex-col gap-3">

        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className="flex min-h-[58px] items-center gap-5 rounded-xl px-5 text-lg font-semibold transition hover:bg-blue-700"
            >
              <Icon size={26} />
              <span>{link.name}</span>
            </Link>
          );
        })}

      </nav>

      {/* BOTTOM BRAND */}
      <div className="mt-auto pt-8">

        <div className="rounded-2xl bg-blue-700 p-5">
          <h2 className="text-xl font-bold">
            AJU Smart Bus
          </h2>

          <p className="mt-2 text-blue-100">
            Admin Panel
          </p>
        </div>

      </div>

    </aside>
  );
}