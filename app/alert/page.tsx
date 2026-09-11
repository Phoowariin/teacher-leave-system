import FiscalPicker from "@/components/FiscalPicker";
import { getSummary } from "@/lib/stats";
import { RULE, STATUS_META, type RuleStatus } from "@/lib/leaveRules";
import { currentFiscalYear } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

const ORDER: Record<RuleStatus, number> = { fail: 0, warn: 1, ok: 2 };

function ProgressBar({ value, max, status }: { value: number; max: number; status: RuleStatus }) {
  const cls = status === "fail" ? "bg-red-500" : status === "warn" ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div className={`h-2 rounded-full ${cls}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export default async function AlertPage({
  searchParams,
}: { searchParams: Promise<{ fy?: string; half?: string }> }) {
  const sp = await searchParams;
  const fy = Number(sp.fy) || currentFiscalYear();
  const half = Number(sp.half) === 2 ? 2 : 1;

  const { stats, totals } = await getSummary(fy, half);
  const rows = [...stats].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status] || b.totalDays - a.totalDays
  );

  const period = half === 1
    ? `1 ต.ค. ${fy + 542} - 31 มี.ค. ${fy + 543}`
    : `1 เม.ย. ${fy + 543} - 30 ก.ย. ${fy + 543}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">แดชบอร์ดเกณฑ์การเลื่อนเงินเดือน</h1>
        <FiscalPicker fy={fy} half={half} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <div className="font-semibold text-blue-900 mb-1">📌 เกณฑ์การพิจารณา (ต่อครึ่งปีงบประมาณ)</div>
        <ul className="list-disc pl-5 text-blue-800 space-y-0.5">
          <li>ลาป่วย + ลากิจส่วนตัว รวมกัน <b>ไม่เกิน {RULE.maxTimes} ครั้ง</b> และ <b>ไม่เกิน {RULE.maxDays} วันทำการ</b></li>
          <li>รอบที่แสดง: ปีงบประมาณ {fy + 543} ครึ่งที่ {half} ({period})</li>
          <li>ชั่วโมงทุเลา: {RULE.includePermission ? "นับรวม" : "ไม่นับรวม"} ในเพดานวันลา ({RULE.hoursPerDay} ชั่วโมง = 1 วันทำการ)</li>
          <li className="text-blue-700">
            * ไม่นับรวม ลาคลอดบุตร ลาอุปสมบท ลาไปช่วยเหลือภริยาที่คลอดบุตร ลาพักผ่อน และการลาที่ได้รับอนุมัติให้ไปราชการ
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="text-xs text-slate-500">ผ่านเกณฑ์</div>
          <div className="text-2xl font-bold">{totals.ok} คน</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500">
          <div className="text-xs text-slate-500">เฝ้าระวัง (≥{RULE.warnTimes} ครั้ง / ≥{RULE.warnDays} วัน)</div>
          <div className="text-2xl font-bold">{totals.warn} คน</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
          <div className="text-xs text-slate-500">ไม่ผ่านเกณฑ์</div>
          <div className="text-2xl font-bold">{totals.fail} คน</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-3">ชื่อ-สกุล / ตำแหน่ง</th>
              <th className="px-3 py-3">ลาป่วย<br /><span className="font-normal">(ครั้ง/วัน)</span></th>
              <th className="px-3 py-3">ลากิจ<br /><span className="font-normal">(ครั้ง/วัน)</span></th>
              <th className="px-3 py-3 w-40">จำนวนครั้ง (≤{RULE.maxTimes})</th>
              <th className="px-3 py-3 w-44">จำนวนวัน (≤{RULE.maxDays})</th>
              <th className="px-3 py-3">ทุเลา</th>
              <th className="px-3 py-3">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.teacherId}
                className={`border-t ${s.status === "fail" ? "bg-red-50" : s.status === "warn" ? "bg-amber-50" : ""}`}>
                <td className="px-4 py-3">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.position} · {s.dept}</div>
                </td>
                <td className="px-3 py-3 text-center">{s.sickTimes} / {s.sickDays}</td>
                <td className="px-3 py-3 text-center">{s.personalTimes} / {s.personalDays}</td>
                <td className="px-3 py-3">
                  <div className="text-center font-semibold mb-1">{s.totalTimes}</div>
                  <ProgressBar value={s.totalTimes} max={RULE.maxTimes} status={s.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="text-center font-semibold mb-1">{s.totalDays} วัน</div>
                  <ProgressBar value={s.totalDays} max={RULE.maxDays} status={s.status} />
                </td>
                <td className="px-3 py-3 text-center">
                  {s.permHours} ชม.
                  <div className="text-xs text-slate-400">{s.permCount} ครั้ง</div>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs border ${STATUS_META[s.status].cls}`}>
                    {STATUS_META[s.status].label}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">ไม่มีข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
