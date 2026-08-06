import { Bus, Clock3, MapPinned } from "lucide-react";

const stats = [
  {
    title: "Active Buses",
    value: "12",
    icon: <Bus size={28} />,
  },
  {
    title: "Running Routes",
    value: "8",
    icon: <MapPinned size={28} />,
  },
  {
    title: "Next Bus",
    value: "5 Min",
    icon: <Clock3 size={28} />,
  },
];

export default function StatsCard() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((item, index) => (
        <div
          key={index}
          className="rounded-2xl bg-white p-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">{item.title}</p>
              <h2 className="mt-2 text-3xl font-bold text-[#005BAC]">
                {item.value}
              </h2>
            </div>

            <div className="rounded-full bg-blue-100 p-4 text-[#005BAC]">
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}