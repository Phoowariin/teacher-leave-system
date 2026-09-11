"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function FiscalPicker({
  fy, half, hideHalf = false,
}: { fy: number; half: number; hideHalf?: boolean }) {
  const router = useRouter();
  const path = usePathname();
  const sp = useSearchParams();

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(sp.toString());
    p.set(k, v);
    router.push(`${path}?${p.toString()}`);
  };

  const now = new Date();
  const cur = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();

  return (
    <div className="flex gap-2 text-sm print:hidden">
      <select
        value={fy}
        onChange={(e) => set("fy", e.target.value)}
        className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
      >
        {Array.from({ length: 6 }, (_, i) => cur + 1 - i).map((y) => (
          <option key={y} value={y}>ปีงบฯ {y + 543}</option>
        ))}
      </select>
      {!hideHalf && (
        <select
          value={half}
          onChange={(e) => set("half", e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="0">ทั้งปี</option>
          <option value="1">ครึ่งแรก (ต.ค.-มี.ค.)</option>
          <option value="2">ครึ่งหลัง (เม.ย.-ก.ย.)</option>
        </select>
      )}
    </div>
  );
}
