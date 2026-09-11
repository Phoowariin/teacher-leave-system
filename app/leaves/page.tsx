import { prisma } from "@/lib/prisma";
import FiscalPicker from "@/components/FiscalPicker";
import StatusButtons from "@/components/StatusButtons";
import DeleteButton from "@/components/DeleteButton";
import { setLeaveStatus, deleteLeave } from "@/app/actions";
import { LEAVE_TYPES, REQ_META } from "@/lib/leaveRules";
import { currentFiscalYear, fiscalRange, thaiDate, toISO, parseISO } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

export default async function LeavesPage({
  searchParams,
}: { searchParams: Promise<{ fy?: string; half?: string }> }) {
  const sp = await searchParams;
  const fy = Number(sp.fy) || currentFiscalYear();
  const half = Number(sp.half) || 0;
  const { from, to } = fiscalRange(fy, half);

  const leaves = await prisma.leave.findMany({
    where: { startDate: { lte: parseISO(to) }, endDate: { gte: parseISO(from) } },
    include: { teacher: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">ทะเบียนการลา</h1>
        <FiscalPicker fy={fy} half={half} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <div className="px-4 py-3 border-b font-semibold text-sm">
          ปีงบประมาณ {fy + 543}{half ? ` · ครึ่งที่ ${half}` : ""} ({leaves.length} รายการ)
        </div>
        <table className="w-full text-sm min-w-[980px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="text-left px-4 py-2">ผู้ขอลา</th>
              <th className="text-left px-3 py-2">ประเภท</th>
              <th className="text-left px-3 py-2">ช่วงวันที่</th>
              <th className="px-3 py-2">จำนวน</th>
              <th className="text-left px-3 py-2">เหตุผล</th>
              <th className="text-left px-3 py-2">ผู้สอนแทน</th>
              <th className="px-3 py-2">สถานะ</th>
              <th className="px-3 py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => {
              const def = LEAVE_TYPES[l.type];
              return (
                <tr key={l.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium">
                    {l.teacher.prefix}{l.teacher.fname} {l.teacher.lname}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
                      style={{ background: def?.color ?? "#94a3b8" }}>
                      {def?.name ?? l.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">
                    {thaiDate(toISO(l.startDate))} - {thaiDate(toISO(l.endDate))}
                  </td>
                  <td className="px-3 py-2 text-center font-semibold">{l.days} วัน</td>
                  <td className="px-3 py-2 text-slate-500 text-xs max-w-[220px] truncate">{l.reason}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{l.substitute ?? "-"}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${REQ_META[l.status].cls}`}>
                      {REQ_META[l.status].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center whitespace-nowrap space-x-2">
                    {l.status === "pending" && <StatusButtons id={l.id} action={setLeaveStatus} />}
                    <DeleteButton id={l.id} action={deleteLeave} />
                  </td>
                </tr>
              );
            })}
            {leaves.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">ยังไม่มีรายการลาในรอบนี้</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
