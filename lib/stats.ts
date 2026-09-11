import { prisma } from "./prisma";
import { LEAVE_TYPES, RULE, evaluate, type RuleStatus } from "./leaveRules";
import { countedDates, fiscalRange, inRange, toISO } from "./fiscal";

export interface TeacherStat {
  teacherId: string;
  name: string;
  position: string;
  dept: string;
  sickDays: number;
  sickTimes: number;
  personalDays: number;
  personalTimes: number;
  totalTimes: number;
  totalDays: number;
  permHours: number;
  permCount: number;
  permDayEq: number;
  allDays: number;
  byType: Record<string, number>;
  status: RuleStatus;
}

export async function getSummary(fy: number, half: number) {
  const { from, to } = fiscalRange(fy, half);

  const [teachers, leaves, perms, holidays, pendingLeave, pendingPerm] = await Promise.all([
    prisma.teacher.findMany({ where: { active: true }, orderBy: [{ dept: "asc" }, { fname: "asc" }] }),
    prisma.leave.findMany({ where: { status: "approved" } }),
    prisma.permission.findMany({ where: { status: "approved" } }),
    prisma.holiday.findMany(),
    prisma.leave.count({ where: { status: "pending" } }),
    prisma.permission.count({ where: { status: "pending" } }),
  ]);

  const hSet = new Set(holidays.map((h) => toISO(h.date)));

  const stats: TeacherStat[] = teachers.map((t) => {
    const mine = leaves.filter((l) => l.teacherId === t.id);
    let sickDays = 0, sickTimes = 0, personalDays = 0, personalTimes = 0, allDays = 0;
    const byType: Record<string, number> = {};

    for (const l of mine) {
      const def = LEAVE_TYPES[l.type];
      if (!def) continue;
      const days = countedDates(toISO(l.startDate), toISO(l.endDate), def.mode, hSet)
        .filter((d) => inRange(d, from, to)).length;
      if (!days) continue;
      byType[l.type] = (byType[l.type] ?? 0) + days;
      allDays += days;
      if (l.type === "sick") { sickDays += days; sickTimes++; }
      if (l.type === "personal") { personalDays += days; personalTimes++; }
    }

    const myPerms = perms.filter((p) => p.teacherId === t.id && inRange(toISO(p.date), from, to));
    const permHours = myPerms.reduce((a, p) => a + p.hours, 0);
    const permDayEq = permHours / RULE.hoursPerDay;

    const totalTimes = sickTimes + personalTimes;
    const totalDays = Number(
      (sickDays + personalDays + (RULE.includePermission ? permDayEq : 0)).toFixed(2)
    );

    return {
      teacherId: t.id,
      name: `${t.prefix}${t.fname} ${t.lname}`,
      position: t.position,
      dept: t.dept,
      sickDays, sickTimes, personalDays, personalTimes,
      totalTimes, totalDays,
      permHours: Number(permHours.toFixed(2)),
      permCount: myPerms.length,
      permDayEq: Number(permDayEq.toFixed(2)),
      allDays, byType,
      status: evaluate(totalTimes, totalDays),
    };
  });

  const byTypeAll: Record<string, number> = {};
  stats.forEach((s) =>
    Object.entries(s.byType).forEach(([k, v]) => { byTypeAll[k] = (byTypeAll[k] ?? 0) + v; })
  );

  return {
    teachers, stats, byTypeAll,
    pendingCount: pendingLeave + pendingPerm,
    totals: {
      teacherCount: teachers.length,
      days: stats.reduce((a, s) => a + s.allDays, 0),
      permHours: Number(stats.reduce((a, s) => a + s.permHours, 0).toFixed(1)),
      fail: stats.filter((s) => s.status === "fail").length,
      warn: stats.filter((s) => s.status === "warn").length,
      ok: stats.filter((s) => s.status === "ok").length,
    },
  };
}

export async function getQuotaUsed(teacherId: string, fy: number) {
  const { from, to } = fiscalRange(fy, 0);
  const [leaves, holidays] = await Promise.all([
    prisma.leave.findMany({ where: { teacherId, status: "approved" } }),
    prisma.holiday.findMany(),
  ]);
  const hSet = new Set(holidays.map((h) => toISO(h.date)));
  const used: Record<string, number> = {};
  for (const l of leaves) {
    const def = LEAVE_TYPES[l.type];
    if (!def) continue;
    used[l.type] = (used[l.type] ?? 0) +
      countedDates(toISO(l.startDate), toISO(l.endDate), def.mode, hSet)
        .filter((d) => inRange(d, from, to)).length;
  }
  return used;
}
