import { prisma } from "@/lib/prisma";
import TeacherForm from "./TeacherForm";
import DeleteButton from "@/components/DeleteButton";
import { deleteTeacher } from "@/app/actions";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: [{ dept: "asc" }, { fname: "asc" }],
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">ข้อมูลข้าราชการครู</h1>

      <div className="grid lg:grid-cols-3 gap-5">
        <TeacherForm />

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="px-4 py-3 border-b font-semibold text-sm">
            รายชื่อทั้งหมด ({teachers.length} คน)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="text-left px-4 py-2">ชื่อ-สกุล</th>
                  <th className="text-left px-4 py-2">ตำแหน่ง</th>
                  <th className="text-left px-4 py-2">กลุ่มสาระ</th>
                  <th className="px-3 py-2">สายการสอน</th>
                  <th className="px-3 py-2">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <div className="font-medium">{t.prefix}{t.fname} {t.lname}</div>
                      <div className="text-xs text-slate-400">{t.empNo ?? "-"}</div>
                    </td>
                    <td className="px-4 py-2">{t.position}</td>
                    <td className="px-4 py-2 text-slate-500">{t.dept}</td>
                    <td className="px-3 py-2 text-center">{t.isTeaching ? "✔️" : "—"}</td>
                    <td className="px-3 py-2 text-center">
                      <DeleteButton
                        id={t.id}
                        action={deleteTeacher}
                        confirmText="ยืนยันการลบ? ข้อมูลการลาและการขออนุญาตทั้งหมดของครูท่านนี้จะถูกลบด้วย"
                      />
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">ยังไม่มีข้อมูล</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
