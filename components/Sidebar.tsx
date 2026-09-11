"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "แดชบอร์ดสรุป", icon: "📊" },
  { href: "/alert", label: "เกณฑ์เลื่อนเงินเดือน", icon: "🚨" },
  { href: "/teachers", label: "ข้อมูลข้าราชการครู", icon: "👩‍🏫" },
  { href: "/leaves/new", label: "ยื่นใบลา", icon: "📝" },
  { href: "/leaves", label: "ทะเบียนการลา", icon: "📋" },
  { href: "/permissions", label: "ขออนุญาต (ทุเลา)", icon: "⏱️" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 md:w-60 shrink-0 bg-slate-900 text-slate-300 print:hidden">
      <div className="p-5 border-b border-slate-700">
        <div className="text-white font-bold leading-tight">ระบบแจ้งลา</div>
        <div className="text-xs text-slate-400 mt-0.5">ข้าราชการครูและบุคลากรทางการศึกษา</div>
        <div className="text-xs text-blue-400 mt-1">สังกัด สพฐ.</div>
      </div>
      <nav className="p-3 space-y-1 text-sm">
        {NAV.map((n) => {
          const active =
            n.href === "/" ? path === "/" :
            n.href === "/leaves" ? path === "/leaves" :
            path.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2 rounded-lg transition ${
                active ? "bg-blue-700 text-white" : "hover:bg-slate-800"
              }`}
            >
              <span className="mr-2">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
