"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPermission, initialState } from "@/app/actions";
import { PERM_REASONS, RULE } from "@/lib/leaveRules";

type T = { id: string; prefix: string; fname: string; lname: string };

export default function PermissionForm({ teachers }: { teachers: T[] }) {
  const [state, action, pending] = useActionState(createPermission, initialState);
  const ref = useRef<HTMLFormElement>(null);
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("12:00");

  useEffect(() => {
    if (state.ok) { ref.current?.reset(); setFrom("09:00"); setTo("12:00"); }
  }, [state.ok]);

  const hours = (() => {
    if (!from || !to) return 0;
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    const h = ((th * 60 + tm) - (fh * 60 + fm)) / 60;
    return h > 0 ? Number(h.toFixed(2)) : 0;
  })();

  return (
    <form ref={ref} action={action}
      className="bg-white rounded-xl p-6 shadow-sm space-y-3 text-sm h-fit">
      <div className="font-semibold border-b pb-2">⏱️ แบบขออนุญาตออกนอกสถานศึกษา (ทุเลา)</div>

      <div className="text-xs bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-lg p-2">
        นับเป็น <b>ชั่วโมง</b> · {RULE.hoursPerDay} ชั่วโมง = 1 วันทำการ · ไม่หักสิทธิวันลา
      </div>

      <label className="block">
        <span className="text-xs text-slate-500">ผู้ขออนุญาต *</span>
        <select name="teacherId" required className="border border-slate-300 rounded-lg px-3 py-2 w-full">
          <option value="">— เลือก —</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.prefix}{t.fname} {t.lname}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-slate-500">วันที่ *</span>
        <input type="date" name="date" required className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-xs text-slate-500">ออกเวลา *</span>
          <input type="time" name="timeFrom" required value={from} onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">กลับเวลา *</span>
          <input type="time" name="timeTo" required value={to} onChange={(e) => setTo(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
        </label>
      </div>

      <div className="bg-slate-100 rounded-lg p-3 text-center">
        <div className="text-xs text-slate-500">รวมเวลาที่ขออนุญาต</div>
        <div className="text-2xl font-bold text-cyan-700">{hours.toFixed(2)} ชม.</div>
        <div className="text-xs text-slate-500">≈ {(hours / RULE.hoursPerDay).toFixed(2)} วันทำการ</div>
      </div>

      <label className="block">
        <span className="text-xs text-slate-500">เหตุผล *</span>
        <select name="reason" className="border border-slate-300 rounded-lg px-3 py-2 w-full">
          {PERM_REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>

      <input name="detail" placeholder="รายละเอียดเพิ่มเติม / สถานที่ที่จะไป"
        className="border border-slate-300 rounded-lg px-3 py-2 w-full" />
      <input name="substitute" placeholder="ผู้ปฏิบัติหน้าที่แทน / คาบสอนแทน"
        className="border border-slate-300 rounded-lg px-3 py-2 w-full" />

      {state.error && <p className="text-red-600 text-xs">{state.error}</p>}
      {state.ok && <p className="text-green-600 text-xs">✅ บันทึกเรียบร้อย (สถานะ: รออนุมัติ)</p>}

      <button disabled={pending || hours <= 0}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium">
        {pending ? "กำลังบันทึก..." : "บันทึกการขออนุญาต"}
      </button>
    </form>
  );
}
