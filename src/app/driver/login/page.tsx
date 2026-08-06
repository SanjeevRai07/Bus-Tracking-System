import AuthCard from "@/components/shared/AuthCard";

export default function DriverLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <AuthCard
        title="Driver Login"
        subtitle="Login to start your trip"
      />
    </main>
  );
}