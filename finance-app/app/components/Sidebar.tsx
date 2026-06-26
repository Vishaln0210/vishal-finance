"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, CalendarDays,
  HandCoins, Tag, IndianRupee,
} from "lucide-react";

const nav = [
  { href: "/",             label: "Dashboard",    icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/monthly",      label: "Monthly",      icon: CalendarDays },
  { href: "/lent",         label: "Lent",         icon: HandCoins },
  { href: "/categories",   label: "Categories",   icon: Tag },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-[#1A1F3A] text-white flex-col z-50">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-7 h-7 text-emerald-400" />
            <div>
              <p className="font-bold text-base leading-tight">Vishal&apos;s</p>
              <p className="text-xs text-white/50 leading-tight">Finance Tracker</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-emerald-500 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/30">
          Personal · Private · Yours
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1F3A] z-50 border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around px-1 py-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[10px] font-medium transition-all min-w-[56px]
                  ${active
                    ? "text-emerald-400"
                    : "text-white/40"
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-emerald-400" : ""}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
