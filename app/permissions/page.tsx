import { prisma } from "@/lib/prisma";
import PermissionForm from "./PermissionForm";
import FiscalPicker from "@/components/FiscalPicker";
import StatusButtons from "@/components/StatusButtons";
import DeleteButton from "@/components/DeleteButton";
import { setPermissionStatus, deletePermission } from "@/app/actions";
import { REQ_META, RULE } from "@/lib/leaveRules";
import { currentFiscalYear, fiscalRange, parseISO, thaiDate, toISO } from "@/lib/fiscal";

export const dynamic = "force-dynamic";

export default async function PermissionsPage({
  searchParams,
}: { searchParams: Promise<{ fy?: string; half?: string }> }) {
  const sp = await searchParams;
  const fy = Number(sp.fy) || currentFiscalYear();
  const half = Number(sp.half) || 0;
  const { from, to } = fiscalRange(fy, half);

  const [teachers, perms] = await Promise.all([
    prisma.teacher.findMany({
      where: { active: true }, orderBy: { fname: "asc" },
      select: { id: true, prefix: true, fname: true, lname: true },
    }),
    prisma.permission.findMany({
      where: { date: { gte: parseISO(from), lte: parseISO(to) } },
      include: { teacher: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalHours = perms
    .filter((p) => p.status === "approved")
    .reduce((a, p) => a + p.hours, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">การขออนุญาต (ทุเลา)</h1>
        <FiscalPicker fy={fy} half={half} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {teachers.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 shadow-sm">
            กรุณาเพิ่มข้อมูลข้าราชการครูก่อน
          </div>
        ) : (
          <PermissionForm teachers={teachers} />
        )}

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="px-4 py-3 border-b font-semibold text-sm flex flex-wrap justify-between gap-2">
            <span>ประวัติการขออนุญาต · ปีงบฯ {fy + 543}{half ? ` ครึ่งที่ ${half}` : ""}</span>
            <span className="text-cyan-700">
              รวมอนุมัติแล้ว {totalHours.toFixed(2)} ชม.
              <span className="text-slate-400 font-normal">
                {" "}(≈ {(totalHours / RULE.hoursPerDay).toFixed(2)} วันทำการ)
              </span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">วันที่</th>
                  <th className="text-left px-3 py-2">ผู้ขออนุญาต</th>
                  <th className="px-3 py-2">เวลา</th>
                  <th className="px-3 py-2">ชั่วโมง</th>
                  <th className="text-left px-3 py-2">เหตุผล</th>
                  <th className="px-3 py-2">สถานะ</th>
                  <th className="px-3 py-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 whitespace-nowrap">{thaiDate(toISO(p.date))}</td>
                    <td className="px-3 py-2">{p.teacher.prefix}{p.teacher.fname} {p.teacher.lname}</td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">{p.timeFrom}-{p.timeTo}</td>
                    <td className="px-3 py-2 text-center font-semibold text-cyan-700">{p.hours}</td>
                    <td className="px-3 py-2 text-xs text-slate-500 max-w-[200px] truncate">
                      {p.reason}{p.detail ? ` · ${p.detail}` : ""}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${REQ_META[p.status].cls}`}>
                        {REQ_META[p.status].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap space-x-2">
                      {p.status === "pending" && <StatusButtons id={p.id} action={setPermissionStatus} />}
                      <DeleteButton id={p.id} action={deletePermission} />
                    </td>
                  </tr>
                ))}
                {perms.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">ยังไม่มีรายการ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
