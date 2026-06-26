"use client";
import Sidebar from "./Sidebar";
import LockScreen from "./LockScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LockScreen>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
      </div>
    </LockScreen>
  );
}
