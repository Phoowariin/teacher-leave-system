import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบแจ้งลาข้าราชการครู | สพฐ.",
  description: "ระบบบริหารจัดการวันลาข้าราชการครูและบุคลากรทางการศึกษา",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} bg-slate-100 text-slate-800 antialiased`}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
        </div>
      </body>
    </html>
  );
}
