"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Admin login page is public
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    let mounted = true;

    async function checkAdminSession() {
      // Do not protect the login page
      if (isLoginPage) {
        if (mounted) {
          setCheckingAuth(false);
        }
        return;
      }

      setCheckingAuth(true);

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Admin session check error:",
            error
          );
        }

        // User is not logged in
        if (!session?.user) {
          router.replace("/admin/login");
          return;
        }

        if (mounted) {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error(
          "Admin authentication error:",
          error
        );

        router.replace("/admin/login");
      }
    }

    checkAdminSession();

    return () => {
      mounted = false;
    };
  }, [isLoginPage, pathname, router]);

  // =====================================================
  // LOGIN PAGE
  // =====================================================

  if (isLoginPage) {
    return <>{children}</>;
  }

  // =====================================================
  // CHECKING SESSION
  // =====================================================

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl shadow-sm">
            🚌
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#005BAC]">
            AJU Smart Bus
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Checking admin session...
          </p>

          <div className="mx-auto mt-5 h-2 w-48 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#005BAC]" />
          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // PROTECTED ADMIN AREA
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* SIDEBAR */}

      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* MAIN CONTENT */}

      <div className="min-h-screen lg:pl-[280px]">

        {/* MOBILE HEADER */}

        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm"
            aria-label="Open admin menu"
          >
            ☰
          </button>

          <div className="ml-3">
            <p className="text-sm font-black text-slate-900">
              AJU Smart Bus
            </p>

            <p className="text-xs font-semibold text-[#005BAC]">
              Admin Panel
            </p>
          </div>

        </header>

        {/* PAGE CONTENT */}

        <main className="min-h-screen">
          {children}
        </main>

      </div>
    </div>
  );
}