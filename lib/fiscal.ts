export const TH_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export function toISO(d: Date | string): string {
  if (typeof d === "string") return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export function parseISO(s: string): Date {
  return new Date(s + "T00:00:00.000Z");
}

/** ปีงบประมาณ (ค.ศ.): 1 ต.ค. YYYY-1 ถึง 30 ก.ย. YYYY */
export function fiscalYearOf(iso: string): number {
  const [y, m] = iso.split("-").map(Number);
  return m >= 10 ? y + 1 : y;
}

/** 1 = ครึ่งแรก (ต.ค.-มี.ค.) , 2 = ครึ่งหลัง (เม.ย.-ก.ย.) */
export function halfOf(iso: string): number {
  const m = Number(iso.split("-")[1]);
  return m >= 10 || m <= 3 ? 1 : 2;
}

export function fiscalRange(fy: number, half: number) {
  if (half === 1) return { from: `${fy - 1}-10-01`, to: `${fy}-03-31` };
  if (half === 2) return { from: `${fy}-04-01`, to: `${fy}-09-30` };
  return { from: `${fy - 1}-10-01`, to: `${fy}-09-30` };
}

export function thaiDate(iso: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${TH_MONTHS[m - 1]} ${y + 543}`;
}

export function currentFiscalYear(): number {
  const now = new Date();
  return now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
}

/** ไล่วันทีละวัน คืนเฉพาะวันที่นับเป็นวันลา */
export function countedDates(
  startISO: string,
  endISO: string,
  mode: "working" | "calendar",
  holidays: Set<string> = new Set()
): string[] {
  const out: string[] = [];
  const d = parseISO(startISO);
  const end = parseISO(endISO);
  if (isNaN(d.getTime()) || isNaN(end.getTime()) || d > end) return out;

  let guard = 0;
  while (d <= end && guard < 3000) {
    guard++;
    const iso = toISO(d);
    const dow = d.getUTCDay();
    if (mode === "calendar" || (dow !== 0 && dow !== 6 && !holidays.has(iso))) {
      out.push(iso);
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function inRange(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to;
}
