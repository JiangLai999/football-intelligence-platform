import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Football Intelligence Platform",
  description: "Professional football analytics, odds intelligence and match prediction platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
          <Sidebar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
