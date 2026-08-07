import AddBusModal from "@/components/dashboard/AddBusModal";
import BusList from "@/components/dashboard/BusList";

export default function BusManagement() {
  return (
    <main className="flex-1 min-h-screen bg-slate-100 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[#005BAC]">
          Bus Management
        </h1>

        <AddBusModal />
      </div>

      <BusList />
    </main>
  );
}