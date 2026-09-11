"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createLeave, initialState } from "@/app/actions";
import { LEAVE_TYPES, SCHOOL } from "@/lib/leaveRules";

type T = {
  id: string; prefix: string; fname: string; lname: string;
  position: string; isTeaching: boolean;
};

export default function LeaveForm({ teachers }: { teachers: T[] }) {
  const [state, action, pending] = useActionState(createLeave, initialState);
  const ref = useRef<HTMLFormElement>(null);
  const [tid, setTid] = useState("");
  const [type, setType] = useState("sick");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (state.ok) { ref.current?.reset(); setTid(""); setType("sick"); setStart(""); setEnd(""); }
  }, [state.ok]);

  const teacher = teachers.find((t) => t.id === tid);
  const def = LEAVE_TYPES[type];
  const blocked = Boolean(def.blockedForTeaching && teacher?.isTeaching);

  const roughDays = (() => {
    if (!start || !end || end < start) return 0;
    let n = 0;
    const d = new Date(start + "T00:00:00.000Z");
    const e = new Date(end + "T00:00:00.000Z");
    while (d <= e) {
      const dow = d.getUTCDay();
      if (def.mode === "calendar" || (dow !== 0 && dow !== 6)) n++;
      d.setUTCDate(d.getUTCDate() + 1);
    }
    return n;
  })();

  return (
    <form ref={ref} action={action}
      className="bg-white rounded-xl p-6 shadow-sm space-y-4 text-sm max-w-3xl">
      <div className="text-center border-b pb-3">
        <div className="font-bold text-base">แบบใบลา — {SCHOOL.name}</div>
        <div className="text-xs text-slate-500">{SCHOOL.area}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-slate-500">ผู้ขอลา *</span>
          <select name="teacherId" required value={tid} onChange={(e) => setTid(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full">
            <option value="">— เลือกผู้ขอลา —</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.prefix}{t.fname} {t.lname} ({t.position})</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-slate-500">ประเภทการลา *</span>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full">
            {Object.entries(LEAVE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-slate-500">ลาตั้งแต่วันที่ *</span>
          <input type="date" name="startDate" required value={start} onChange={(e) => setStart(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
        </label>

        <label className="block">
          <span className="text-xs text-slate-500">ถึงวันที่ *</span>
          <input type="date" name="endDate" required value={end} onChange={(e) => setEnd(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
        </label>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
        นับแบบ: <b>{def.mode === "working" ? "วันทำการ (ไม่นับ ส.-อา. และวันหยุดราชการ)" : "วันตามปฏิทิน (นับรวมวันหยุด)"}</b>
        {def.quota && <> · สิทธิ {def.quota} วัน / ปีงบประมาณ</>}
        {roughDays > 0 && <> · <span className="text-blue-700 font-semibold">ประมาณ {roughDays} วัน</span></>}
        {def.note && <div className="text-slate-500 mt-1">* {def.note}</div>}
      </div>

      {blocked && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-3 py-2 text-xs">
          ⛔ ข้าราชการครูสายงานการสอนที่ได้รับวันหยุดภาคเรียน <b>ไม่มีสิทธิลาพักผ่อน</b>
        </div>
      )}

      <label className="block">
        <span className="text-xs text-slate-500">เนื่องจาก (เหตุผลการลา) *</span>
        <textarea name="reason" required rows={2}
          placeholder="เช่น ป่วยเป็นไข้หวัดใหญ่ / ไปทำธุระส่วนตัวที่ต่างจังหวัด"
          className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
      </label>

      <div className="grid md:grid-cols-2 gap-3">
        <input name="address" placeholder="ที่อยู่ที่ติดต่อได้ระหว่างลา"
          className="border border-slate-300 rounded-lg px-3 py-2" />
        <input name="phone" placeholder="เบอร์โทรศัพท์"
          className="border border-slate-300 rounded-lg px-3 py-2" />
        <input name="substitute" placeholder="ผู้ปฏิบัติหน้าที่สอนแทน"
          className="border border-slate-300 rounded-lg px-3 py-2" />
        <input name="periods" placeholder="คาบสอนที่ต้องจัดสอนแทน"
          className="border border-slate-300 rounded-lg px-3 py-2" />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="medicalCert" className="w-4 h-4" />
        <span>แนบใบรับรองแพทย์ (บังคับกรณีลาป่วยตั้งแต่ 30 วันทำการขึ้นไป)</span>
      </label>

      {state.error && <p className="text-red-600 text-xs">{state.error}</p>}
      {state.ok && <p className="text-green-600 text-xs">✅ บันทึกใบลาเรียบร้อย (สถานะ: รออนุมัติ)</p>}

      <button disabled={pending || blocked}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium">
        {pending ? "กำลังบันทึก..." : "บันทึกใบลา"}
      </button>
    </form>
  );
}
