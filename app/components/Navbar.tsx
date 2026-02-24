"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Create", path: "/" },
    { name: "Tasks", path: "/tasks" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Guide", path: "/guide" },

  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b-2 border-gray-200 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-xl font-black text-black uppercase tracking-wider hover:scale-105 transition-transform">
            THE PRESS
          </Link>

          {/* Navigation Tabs */}
          <div className="flex gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    text-sm font-semibold uppercase tracking-wider
                    transition-all relative pb-1
                    ${
                      isActive
                        ? "text-[#3C5A99]"
                        : "text-gray-600 hover:text-black"
                    }
                  `}
                >
                  {item.name}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3C5A99]"></div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="w-20"></div>
        </div>
      </div>
    </nav>
  );
}