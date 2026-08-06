import AuthCard from "@/components/shared/AuthCard";

export default function AdminLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <AuthCard
        title="Admin Login"
        subtitle="Manage buses and routes"
      />
    </main>
  );
}