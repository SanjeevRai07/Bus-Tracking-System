import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminDashboard() {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 bg-slate-100 min-h-screen p-8">
        <h1 className="text-4xl font-bold text-[#005BAC]">
          Admin Dashboard
        </h1>

        <p className="mt-3 text-gray-600">
          Manage buses, drivers, routes and students.
        </p>
      </main>
    </div>
  );
}