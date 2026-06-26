"use client";
import Sidebar from "./Sidebar";
import LockScreen from "./LockScreen";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <LockScreen>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </LockScreen>
  );
}
