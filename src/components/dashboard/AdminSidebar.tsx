"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "▦",
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
  const router = useRouter();

  // ---------------------------------------------
  // LOGOUT
  // ---------------------------------------------
  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    router.replace("/admin/login");
  }

  // ---------------------------------------------
  // ACTIVE MENU
  // ---------------------------------------------
  function isActive(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  return (
    <>
      {/* =========================================
          MOBILE BACKDROP
      ========================================= */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[280px]
          flex-col overflow-hidden
          border-r border-white/10
          bg-[#07152b] text-white
          shadow-2xl
          transition-transform duration-300
          lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* =======================================
            BRAND
        ======================================= */}
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            {/* LOGO */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl shadow-lg shadow-blue-500/20">
              🚌
            </div>

            {/* TITLE */}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-tight text-white">
                AJU Smart Bus
              </h1>

              <p className="mt-0.5 text-xs font-medium text-blue-200">
                Admin Panel
              </p>
            </div>

            {/* MOBILE CLOSE */}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
        </div>

        {/* =======================================
            ADMIN PROFILE
        ======================================= */}
        <div className="px-4 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              {/* AVATAR */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-xl">
                👤
              </div>

              {/* INFO */}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  Administrator
                </p>

                <p className="truncate text-xs text-slate-400">
                  System Admin
                </p>
              </div>

              {/* ONLINE */}
              <span className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            </div>
          </div>
        </div>

        {/* =======================================
            NAVIGATION
        ======================================= */}
        <nav className="flex-1 overflow-y-auto px-4 pb-5">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Management
          </p>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3
                    rounded-xl px-4 py-3.5
                    text-sm font-semibold
                    transition-all duration-200
                    ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  {/* ICON */}
                  <span
                    className={`
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-lg text-base
                      transition
                      ${
                        active
                          ? "bg-white/15"
                          : "bg-white/5 group-hover:bg-white/10"
                      }
                    `}
                  >
                    {item.icon}
                  </span>

                  {/* NAME */}
                  <span>{item.name}</span>

                  {/* ACTIVE DOT */}
                  {active && (
                    <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* =======================================
            LOGOUT
        ======================================= */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="
              group flex w-full items-center gap-3
              rounded-xl
              border border-red-400/10
              bg-red-500/5
              px-4 py-3.5
              text-sm font-semibold
              text-red-300
              transition-all duration-200
              hover:bg-red-500/10
              hover:text-red-200
            "
          >
            {/* ICON */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-lg">
              ↪
            </span>

            {/* TEXT */}
            <span>Logout</span>

            {/* ARROW */}
            <span className="ml-auto transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}