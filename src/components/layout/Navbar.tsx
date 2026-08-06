"use client";

import Link from "next/link";
import { BusFront, Menu } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Live Tracking", href: "/tracking" },
  { name: "Routes", href: "/routes" },
  { name: "Schedule", href: "/schedule" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-[#005BAC] p-2 text-white">
            <BusFront size={24} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-[#005BAC]">
              AJU Smart Bus
            </h1>
            <p className="text-xs text-gray-500">
              Tracking System
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="font-medium text-gray-700 transition hover:text-[#005BAC]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex gap-3">
          <button className="rounded-lg border border-[#005BAC] px-5 py-2 font-medium text-[#005BAC] hover:bg-blue-50">
            Student
          </button>

          <button className="rounded-lg bg-[#005BAC] px-5 py-2 font-medium text-white hover:bg-blue-700">
            Login
          </button>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setOpen(!open)}
        >
          <Menu />
        </button>
      </div>

      {open && (
        <div className="border-t bg-white lg:hidden">
          <div className="flex flex-col px-6 py-4">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="py-3 text-gray-700"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}