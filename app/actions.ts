"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { LEAVE_TYPES } from "@/lib/leaveRules";
import { countedDates, fiscalYearOf, halfOf, parseISO, toISO } from "@/lib/fiscal";

export type ActionState = { ok: boolean; error: string };
export const initialState: ActionState = { ok: false, error: "" };

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/alert");
  revalidatePath("/teachers");
  revalidatePath("/leaves");
  revalidatePath("/leaves/new");
  revalidatePath("/permissions");
}

/* ---------------- ข้อมูลครู ---------------- */
const TeacherSchema = z.object({
  id: z.string().optional(),
  prefix: z.string().min(1),
  fname: z.string().min(1, "กรุณากรอกชื่อ"),
  lname: z.string().min(1, "กรุณากรอกนามสกุล"),
  cid: z.union([z.string().regex(/^\d{13}$/, "เลขประจำตัวประชาชนต้องมี 13 หลัก"), z.literal("")]),
  empNo: z.string().optional(),
  position: z.string().min(1),
  dept: z.string().min(1),
  startWork: z.string().optional(),
  isTeaching: z.boolean(),
  phone: z.string().optional(),
  email: z.union([z.string().email("รูปแบบอีเมลไม่ถูกต้อง"), z.literal("")]),
});

export async function saveTeacher(_prev: ActionState, form: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(form) as Record<string, string>;
  const parsed = TeacherSchema.safeParse({
    ...raw,
    cid: raw.cid ?? "",
    email: raw.email ?? "",
    isTeaching: raw.isTeaching === "on",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const { id, startWork, cid, email, ...rest } = parsed.data;
  const data = {
    ...rest,
    cid: cid || null,
    email: email || null,
    startWork: startWork ? parseISO(startWork) : null,
  };

  try {
    if (id) await prisma.teacher.update({ where: { id }, data });
    else await prisma.teacher.create({ data });
  } catch {
    return { ok: false, error: "บันทึกไม่สำเร็จ (เลขประจำตัวประชาชนอาจซ้ำ)" };
  }

  revalidateAll();
  return { ok: true, error: "" };
}

export async function deleteTeacher(id: string) {
  await prisma.teacher.delete({ where: { id } });
  revalidateAll();
}

/* ---------------- ใบลา ---------------- */
export async function createLeave(_prev: ActionState, form: FormData): Promise<ActionState> {
  const f = Object.fromEntries(form) as Record<string, string>;
  const { teacherId, type, startDate, endDate, reason } = f;

  if (!teacherId) return { ok: false, error: "กรุณาเลือกผู้ขอลา" };
  if (!type || !LEAVE_TYPES[type]) return { ok: false, error: "ประเภทการลาไม่ถูกต้อง" };
  if (!startDate || !endDate) return { ok: false, error: "กรุณาระบุช่วงวันที่ลา" };
  if (!reason || !reason.trim()) return { ok: false, error: "กรุณาระบุเหตุผลการลา" };
  if (endDate < startDate) return { ok: false, error: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มลา" };

  const def = LEAVE_TYPES[type];
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return { ok: false, error: "ไม่พบข้อมูลผู้ขอลา" };

  if (def.blockedForTeaching && teacher.isTeaching)
    return { ok: false, error: "ข้าราชการครูสายงานการสอนที่ได้รับวันหยุดภาคเรียน ไม่มีสิทธิลาพักผ่อน" };

  const holidays = await prisma.holiday.findMany();
  const hSet = new Set(holidays.map((h) => toISO(h.date)));
  const days = countedDates(startDate, endDate, def.mode, hSet).length;
  if (days === 0) return { ok: false, error: "ช่วงวันที่เลือกไม่มีวันทำการ" };

  if (type === "sick" && days >= 30 && f.medicalCert !== "on")
    return { ok: false, error: "ลาป่วยตั้งแต่ 30 วันทำการขึ้นไป ต้องแนบใบรับรองแพทย์" };

  await prisma.leave.create({
    data: {
      teacherId, type, reason: reason.trim(),
      startDate: parseISO(startDate),
      endDate: parseISO(endDate),
      days,
      address: f.address || null,
      phone: f.phone || null,
      substitute: f.substitute || null,
      periods: f.periods || null,
      medicalCert: f.medicalCert === "on",
      fiscalYear: fiscalYearOf(startDate),
      half: halfOf(startDate),
    },
  });

  revalidateAll();
  return { ok: true, error: "" };
}

/* ---------------- ขออนุญาต (ทุเลา) ---------------- */
export async function createPermission(_prev: ActionState, form: FormData): Promise<ActionState> {
  const f = Object.fromEntries(form) as Record<string, string>;
  const { teacherId, date, timeFrom, timeTo, reason } = f;

  if (!teacherId) return { ok: false, error: "กรุณาเลือกผู้ขออนุญาต" };
  if (!date) return { ok: false, error: "กรุณาระบุวันที่" };
  if (!timeFrom || !timeTo) return { ok: false, error: "กรุณาระบุเวลาออกและเวลากลับ" };

  const [fh, fm] = timeFrom.split(":").map(Number);
  const [th, tm] = timeTo.split(":").map(Number);
  const hours = Number((((th * 60 + tm) - (fh * 60 + fm)) / 60).toFixed(2));
  if (hours <= 0) return { ok: false, error: "เวลากลับต้องอยู่หลังเวลาออก" };

  await prisma.permission.create({
    data: {
      teacherId,
      date: parseISO(date),
      timeFrom, timeTo, hours,
      reason: reason || "อื่น ๆ",
      detail: f.detail || null,
      substitute: f.substitute || null,
      fiscalYear: fiscalYearOf(date),
      half: halfOf(date),
    },
  });

  revalidateAll();
  return { ok: true, error: "" };
}

/* ---------------- อนุมัติ / ลบ ---------------- */
export async function setLeaveStatus(id: string, status: "approved" | "rejected") {
  await prisma.leave.update({ where: { id }, data: { status } });
  revalidateAll();
}

export async function setPermissionStatus(id: string, status: "approved" | "rejected") {
  await prisma.permission.update({ where: { id }, data: { status } });
  revalidateAll();
}

export async function deleteLeave(id: string) {
  await prisma.leave.delete({ where: { id } });
  revalidateAll();
}

export async function deletePermission(id: string) {
  await prisma.permission.delete({ where: { id } });
  revalidateAll();
}
