"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Admin login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // All other admin pages
  return (
    <div className="min-h-screen bg-slate-100">
      <AdminSidebar />

      <main className="ml-[370px] min-h-screen w-[calc(100%-370px)]">
        {children}
      </main>
    </div>
  );
}