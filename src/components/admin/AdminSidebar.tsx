"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "📊",
  },
  {
    name: "Buses",
    href: "/admin/buses",
    icon: "🚌",
  },
  {
    name: "Drivers",
    href: "/admin/drivers",
    icon: "👨‍✈️",
  },
  {
    name: "Routes",
    href: "/admin/routes",
    icon: "🛣️",
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: "🎓",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export default function AdminSidebar({
  mobileOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );
    } finally {
      window.location.replace("/");
    }
  }

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[280px]
          flex-col
          border-r border-slate-200
          bg-white
          shadow-xl
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* LOGO */}
        <div className="flex h-20 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              🚌
            </div>

            <div>
              <h1 className="text-lg font-black text-[#005BAC]">
                AJU Smart Bus
              </h1>

              <p className="text-xs font-semibold text-slate-400">
                Administration
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3
                    rounded-2xl px-4 py-3.5
                    text-sm font-bold
                    transition-all
                    ${
                      active
                        ? "bg-[#005BAC] text-white shadow-lg shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#005BAC]"
                    }
                  `}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>

                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ADMIN INFO */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005BAC] text-lg text-white">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-800">
                Administrator
              </p>

              <p className="text-xs font-semibold text-slate-400">
                Admin Panel
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <span className="text-lg">
              ↪
            </span>

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}