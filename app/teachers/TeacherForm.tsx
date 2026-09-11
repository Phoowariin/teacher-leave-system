"use client";

import { useActionState, useEffect, useRef } from "react";
import { saveTeacher, initialState } from "@/app/actions";
import { POSITIONS, DEPARTMENTS } from "@/lib/leaveRules";

export default function TeacherForm() {
  const [state, action, pending] = useActionState(saveTeacher, initialState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state.ok]);

  return (
    <form ref={ref} action={action}
      className="bg-white rounded-xl p-5 shadow-sm space-y-3 text-sm h-fit">
      <div className="font-semibold border-b pb-2">➕ เพิ่มข้อมูลข้าราชการครู</div>

      <div className="grid grid-cols-3 gap-2">
        <select name="prefix" className="border border-slate-300 rounded-lg px-2 py-2">
          <option>นาย</option><option>นาง</option><option>นางสาว</option><option>ว่าที่ ร.ต.</option>
        </select>
        <input name="fname" required placeholder="ชื่อ" className="border border-slate-300 rounded-lg px-3 py-2" />
        <input name="lname" required placeholder="นามสกุล" className="border border-slate-300 rounded-lg px-3 py-2" />
      </div>

      <input name="cid" maxLength={13} placeholder="เลขประจำตัวประชาชน (13 หลัก)"
        className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
      <input name="empNo" placeholder="ตำแหน่งเลขที่"
        className="border border-slate-300 rounded-lg px-3 py-2 w-full" />

      <select name="position" className="border border-slate-300 rounded-lg px-3 py-2 w-full">
        {POSITIONS.map((p) => <option key={p}>{p}</option>)}
      </select>
      <select name="dept" className="border border-slate-300 rounded-lg px-3 py-2 w-full">
        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
      </select>

      <label className="block">
        <span className="text-xs text-slate-500">วันบรรจุเข้ารับราชการ</span>
        <input type="date" name="startWork" className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
      </label>

      <label className="flex items-start gap-2">
        <input type="checkbox" name="isTeaching" defaultChecked className="mt-1 w-4 h-4" />
        <span>สายงานการสอน (ได้รับวันหยุดภาคเรียน → ไม่มีสิทธิลาพักผ่อน)</span>
      </label>

      <input name="phone" placeholder="เบอร์โทรศัพท์" className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
      <input name="email" placeholder="อีเมล" className="border border-slate-300 rounded-lg px-3 py-2 w-full" />

      {state.error && <p className="text-red-600 text-xs">{state.error}</p>}
      {state.ok && <p className="text-green-600 text-xs">✅ บันทึกข้อมูลเรียบร้อยแล้ว</p>}

      <button disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium">
        {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
      </button>
    </form>
  );
}
