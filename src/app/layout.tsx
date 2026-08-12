import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AJU Smart Bus",
  description:
    "Real-time university bus tracking and transportation management system.",
  keywords: [
    "AJU Smart Bus",
    "Bus Tracking",
    "University Bus",
    "GPS Tracking",
    "Real Time Bus Tracking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f5f7fb] text-slate-900 antialiased">

        {/* Premium ambient background */}
        <div className="pointer-events-none fixed inset-0 -z-50 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px]" />

          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[120px]" />

          <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[120px]" />
        </div>

        {/* Subtle grid */}
        <div className="pointer-events-none fixed inset-0 -z-40 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#005BAC 1px, transparent 1px), linear-gradient(90deg, #005BAC 1px, transparent 1px)",
              backgroundSize: "45px 45px",
            }}
          />
        </div>

        {/* Application */}
        <div className="relative min-h-screen">
          {children}
        </div>

      </body>
    </html>
  );
}