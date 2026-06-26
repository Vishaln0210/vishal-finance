import type { Metadata, Viewport } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

export const metadata: Metadata = {
  title: "Vishal's Finance Tracker",
  description: "Personal finance tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Finance Tracker",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d6efd",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
