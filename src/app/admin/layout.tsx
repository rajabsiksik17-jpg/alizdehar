import type { Metadata } from "next";
import { cairo } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — Al-Izdehar Logistics",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full bg-surface-muted">{children}</body>
    </html>
  );
}
