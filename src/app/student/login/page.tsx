import AuthCard from "@/components/shared/AuthCard";

export default function StudentLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <AuthCard
        title="Student Login"
        subtitle="Login with your university account"
      />
    </main>
  );
}