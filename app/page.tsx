import FiscalPicker from "@/components/FiscalPicker";
import LeaveChart from "@/components/LeaveChart";
import StatCard from "@/components/StatCard";
import { getSummary } from "@/lib/stats";
import { LEAVE_TYPES, STATUS_META, RULE, SCHOOL } from "@/lib/leaveRules";
import { currentFiscalYear } from "@/lib/fiscal";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard({
  searchParams,
}: { searchParams: Promise<{ fy?: string; half?: string }> }) {
  const sp = await searchParams;
  const fy = Number(sp.fy) || currentFiscalYear();
  const half = Number(sp.half) || 0;

  const { stats, byTypeAll, totals, pendingCount } = await getSummary(fy, half);

  const chartData = Object.entries(byTypeAll)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({
      name: LEAVE_TYPES[k]?.name ?? k,
      value: v,
      fill: LEAVE_TYPES[k]?.color ?? "#94a3b8",
    }));

  const top = [...stats].sort((a, b) => b.totalDays - a.totalDays).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">แดชบอร์ดสรุปการลา</h1>
          <p className="text-xs text-slate-500">{SCHOOL.name} · {SCHOOL.area}</p>
        </div>
        <FiscalPicker fy={fy} half={half} />
      </div>

      {totals.teacherCount === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 shadow-sm">
          ยังไม่มีข้อมูลข้าราชการครู{" "}
          <Link href="/teachers" className="text-blue-600 underline">เพิ่มข้อมูลครู</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard title="ข้าราชการครูทั้งหมด" value={`${totals.teacherCount} คน`}
              sub={`ปีงบฯ ${fy + 543}${half ? ` ครึ่งที่ ${half}` : ""}`} color="border-blue-500" />
            <StatCard title="วันลารวม" value={`${totals.days} วัน`} sub="เฉพาะที่อนุมัติแล้ว" color="border-indigo-500" />
            <StatCard title="ทุเลารวม" value={`${totals.permHours} ชม.`}
              sub={`≈ ${(totals.permHours / RULE.hoursPerDay).toFixed(2)} วันทำการ`} color="border-cyan-500" />
            <StatCard title="รออนุมัติ" value={`${pendingCount} รายการ`} sub="ใบลา + ขออนุญาต" color="border-amber-500" />
            <StatCard title="เกินเกณฑ์" value={`${totals.fail} คน`} sub={`เฝ้าระวังอีก ${totals.warn} คน`} color="border-red-500" />
          </div>

          <LeaveChart
            data={chartData}
            donut={[
              { name: "ผ่านเกณฑ์", value: totals.ok, fill: "#22c55e" },
              { name: "เฝ้าระวัง", value: totals.warn, fill: "#f59e0b" },
              { name: "ไม่ผ่านเกณฑ์", value: totals.fail, fill: "#ef4444" },
            ]}
          />

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold text-sm">
              อันดับผู้ใช้สิทธิลาป่วย / ลากิจส่วนตัวสูงสุด
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[780px]">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="text-left px-4 py-2">ชื่อ-สกุล</th>
                    <th className="text-left px-4 py-2">กลุ่มสาระ</th>
                    <th className="px-3 py-2">ลาป่วย</th>
                    <th className="px-3 py-2">ลากิจ</th>
                    <th className="px-3 py-2">รวม (ครั้ง / วัน)</th>
                    <th className="px-3 py-2">ทุเลา</th>
                    <th className="px-3 py-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((s) => (
                    <tr key={s.teacherId} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium">{s.name}</td>
                      <td className="px-4 py-2 text-slate-500">{s.dept}</td>
                      <td className="px-3 py-2 text-center">{s.sickDays} วัน</td>
                      <td className="px-3 py-2 text-center">{s.personalDays} วัน</td>
                      <td className="px-3 py-2 text-center font-semibold">{s.totalTimes} / {s.totalDays}</td>
                      <td className="px-3 py-2 text-center">{s.permHours} ชม.</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${STATUS_META[s.status].cls}`}>
                          {STATUS_META[s.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
