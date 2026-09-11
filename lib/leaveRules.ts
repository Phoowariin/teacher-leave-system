export type LeaveMode = "working" | "calendar";

export interface LeaveTypeDef {
  name: string;
  quota: number | null;
  mode: LeaveMode;
  color: string;
  salaryRule?: boolean;
  blockedForTeaching?: boolean;
  note?: string;
}

/** ประเภทการลาตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยการลาของข้าราชการ พ.ศ. 2555 */
export const LEAVE_TYPES: Record<string, LeaveTypeDef> = {
  sick: {
    name: "ลาป่วย", quota: 60, mode: "working", color: "#ef4444", salaryRule: true,
    note: "ลาตั้งแต่ 30 วันทำการขึ้นไป ต้องมีใบรับรองแพทย์",
  },
  personal: {
    name: "ลากิจส่วนตัว", quota: 45, mode: "working", color: "#f59e0b", salaryRule: true,
    note: "ปีแรกที่บรรจุเข้ารับราชการ มีสิทธิ 15 วันทำการ",
  },
  childcare: {
    name: "ลากิจส่วนตัวเพื่อเลี้ยงดูบุตร", quota: 150, mode: "working", color: "#fb923c",
    note: "ต่อเนื่องจากลาคลอดบุตร ไม่ได้รับเงินเดือน",
  },
  maternity: {
    name: "ลาคลอดบุตร", quota: 90, mode: "calendar", color: "#ec4899",
    note: "นับรวมวันหยุดราชการ",
  },
  paternity: {
    name: "ลาไปช่วยเหลือภริยาที่คลอดบุตร", quota: 15, mode: "working", color: "#a855f7",
    note: "ต้องลาภายใน 90 วันนับแต่วันที่คลอด",
  },
  vacation: {
    name: "ลาพักผ่อน", quota: 10, mode: "working", color: "#22c55e", blockedForTeaching: true,
    note: "ครูสายผู้สอนที่ได้รับวันหยุดภาคเรียน ไม่มีสิทธิลาพักผ่อน",
  },
  ordination: {
    name: "ลาอุปสมบท / ประกอบพิธีฮัจย์", quota: 120, mode: "calendar", color: "#eab308",
    note: "ลาได้ครั้งเดียวตลอดอายุราชการ",
  },
  military: { name: "ลาเข้ารับการตรวจเลือก / เตรียมพล", quota: null, mode: "calendar", color: "#64748b" },
  study: { name: "ลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย ดูงาน", quota: null, mode: "calendar", color: "#0ea5e9" },
  intl: { name: "ลาไปปฏิบัติงานในองค์การระหว่างประเทศ", quota: null, mode: "calendar", color: "#14b8a6" },
  spouse: { name: "ลาติดตามคู่สมรส", quota: 730, mode: "calendar", color: "#8b5cf6" },
  rehab: { name: "ลาไปฟื้นฟูสมรรถภาพด้านอาชีพ", quota: 365, mode: "calendar", color: "#78716c" },
};

/** เกณฑ์การพิจารณาเลื่อนเงินเดือน ต่อครึ่งปีงบประมาณ */
export const RULE = {
  maxTimes: 6,
  maxDays: 23,
  warnTimes: 5,
  warnDays: 20,
  hoursPerDay: 7,
  includePermission: false,
  permMaxHours: 24,
};

export type RuleStatus = "ok" | "warn" | "fail";

export function evaluate(times: number, days: number): RuleStatus {
  if (times > RULE.maxTimes || days > RULE.maxDays) return "fail";
  if (times >= RULE.warnTimes || days >= RULE.warnDays) return "warn";
  return "ok";
}

export const STATUS_META: Record<RuleStatus, { label: string; cls: string }> = {
  ok: { label: "ผ่านเกณฑ์", cls: "bg-green-100 text-green-700 border-green-300" },
  warn: { label: "เฝ้าระวัง", cls: "bg-amber-100 text-amber-700 border-amber-300" },
  fail: { label: "ไม่ผ่านเกณฑ์", cls: "bg-red-100 text-red-700 border-red-300" },
};

export const REQ_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "รออนุมัติ", cls: "bg-slate-100 text-slate-600" },
  approved: { label: "อนุมัติ", cls: "bg-green-100 text-green-700" },
  rejected: { label: "ไม่อนุมัติ", cls: "bg-red-100 text-red-700" },
};

export const POSITIONS = [
  "ครูผู้ช่วย", "ครู", "ครู (ชำนาญการ)", "ครู (ชำนาญการพิเศษ)",
  "ครู (เชี่ยวชาญ)", "รองผู้อำนวยการสถานศึกษา", "ผู้อำนวยการสถานศึกษา",
];

export const DEPARTMENTS = [
  "ภาษาไทย", "คณิตศาสตร์", "วิทยาศาสตร์และเทคโนโลยี",
  "สังคมศึกษา ศาสนา และวัฒนธรรม", "สุขศึกษาและพลศึกษา", "ศิลปะ",
  "การงานอาชีพ", "ภาษาต่างประเทศ", "ปฐมวัย", "กิจกรรมพัฒนาผู้เรียน", "ฝ่ายบริหาร",
];

export const PERM_REASONS = [
  "ไปราชการ / ประชุมนอกสถานศึกษา", "ติดต่อราชการส่วนตัว", "พบแพทย์ / รับยา",
  "ธุระจำเป็นเร่งด่วน", "รับ-ส่งบุตรหลาน", "อื่น ๆ",
];

export const SCHOOL = {
  name: "โรงเรียนบ้านตัวอย่างวิทยา",
  area: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษา เขต 1",
  director: "นายสมชาย ใจดี",
};
