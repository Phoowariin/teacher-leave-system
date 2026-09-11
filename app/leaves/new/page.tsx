import { prisma } from "@/lib/prisma";
import LeaveForm from "./LeaveForm";

export const dynamic = "force-dynamic";

export default async function NewLeavePage() {
  const teachers = await prisma.teacher.findMany({
    where: { active: true },
    orderBy: { fname: "asc" },
    select: { id: true, prefix: true, fname: true, lname: true, position: true, isTeaching: true },
  });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">ยื่นใบลา</h1>
      {teachers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 shadow-sm">
          กรุณาเพิ่มข้อมูลข้าราชการครูก่อนยื่นใบลา
        </div>
      ) : (
        <LeaveForm teachers={teachers} />
      )}
    </div>
  );
}
