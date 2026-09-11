import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const D = (s: string) => new Date(s + "T00:00:00.000Z");

async function main() {
  await prisma.permission.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.holiday.deleteMany();

  const rows: [string, string, string, string, string][] = [
    ["นาง", "สุดารัตน์", "ใจงาม", "ครู (ชำนาญการพิเศษ)", "ภาษาไทย"],
    ["นาย", "อนุชา", "พงษ์ศิริ", "ครู", "คณิตศาสตร์"],
    ["นางสาว", "ปิยะดา", "แก้วมณี", "ครูผู้ช่วย", "วิทยาศาสตร์และเทคโนโลยี"],
    ["นาย", "ธนกร", "วัฒนศิลป์", "ครู (ชำนาญการ)", "สังคมศึกษา ศาสนา และวัฒนธรรม"],
    ["นาง", "วราภรณ์", "ทองสุข", "ครู", "ภาษาต่างประเทศ"],
    ["นาย", "ชัยวัฒน์", "บุญมี", "ครู (ชำนาญการ)", "สุขศึกษาและพลศึกษา"],
  ];

  const teachers = [];
  for (let i = 0; i < rows.length; i++) {
    const [prefix, fname, lname, position, dept] = rows[i];
    teachers.push(
      await prisma.teacher.create({
        data: {
          prefix, fname, lname, position, dept,
          empNo: `ตำแหน่งเลขที่ ${1200 + i}`,
          isTeaching: true,
          phone: `08${String(10000000 + i * 111111)}`,
        },
      })
    );
  }

  const halfOf = (s: string) => {
    const m = Number(s.split("-")[1]);
    return m >= 10 || m <= 3 ? 1 : 2;
  };

  const L = (teacherId: string, type: string, s: string, e: string, days: number, reason: string) =>
    prisma.leave.create({
      data: {
        teacherId, type, startDate: D(s), endDate: D(e), days, reason,
        status: "approved", substitute: "ครูเวรประจำวัน",
        fiscalYear: 2026, half: halfOf(s),
      },
    });

  await L(teachers[0].id, "sick", "2025-11-06", "2025-11-07", 2, "ป่วยเป็นไข้หวัดใหญ่");
  await L(teachers[0].id, "personal", "2025-12-15", "2025-12-19", 5, "งานบวชบุตรชาย");
  await L(teachers[0].id, "sick", "2026-01-15", "2026-01-16", 2, "ปวดศีรษะไมเกรน");
  await L(teachers[0].id, "sick", "2026-02-03", "2026-02-06", 4, "ผ่าตัดนิ่วในถุงน้ำดี");
  await L(teachers[0].id, "personal", "2026-03-09", "2026-03-20", 10, "ดูแลบิดามารดาป่วย");
  await L(teachers[0].id, "sick", "2026-03-24", "2026-03-26", 3, "พักฟื้นตามคำสั่งแพทย์");

  await L(teachers[1].id, "sick", "2025-10-21", "2025-10-22", 2, "อาหารเป็นพิษ");
  await L(teachers[1].id, "personal", "2026-01-08", "2026-01-09", 2, "ไปงานฌาปนกิจญาติ");
  await L(teachers[1].id, "sick", "2026-02-18", "2026-02-20", 3, "ป่วยไข้เลือดออก");

  await L(teachers[2].id, "personal", "2026-01-22", "2026-01-22", 1, "ติดต่อราชการส่วนตัว");
  await L(teachers[3].id, "sick", "2026-02-05", "2026-02-05", 1, "ปวดฟัน");
  await L(teachers[4].id, "maternity", "2026-01-05", "2026-04-04", 90, "ลาคลอดบุตร");

  await prisma.leave.create({
    data: {
      teacherId: teachers[5].id, type: "personal",
      startDate: D("2026-03-18"), endDate: D("2026-03-19"), days: 2,
      reason: "ธุระส่วนตัว", status: "pending", fiscalYear: 2026, half: 1,
    },
  });

  await prisma.permission.createMany({
    data: [
      { teacherId: teachers[0].id, date: D("2026-01-09"), timeFrom: "13:00", timeTo: "16:00", hours: 3, reason: "พบแพทย์ / รับยา", detail: "รพ.ประจำอำเภอ", status: "approved", fiscalYear: 2026, half: 1 },
      { teacherId: teachers[0].id, date: D("2026-02-06"), timeFrom: "09:00", timeTo: "11:30", hours: 2.5, reason: "ติดต่อราชการส่วนตัว", detail: "ที่ว่าการอำเภอ", status: "approved", fiscalYear: 2026, half: 1 },
      { teacherId: teachers[1].id, date: D("2026-01-16"), timeFrom: "14:00", timeTo: "16:30", hours: 2.5, reason: "รับ-ส่งบุตรหลาน", status: "approved", fiscalYear: 2026, half: 1 },
      { teacherId: teachers[2].id, date: D("2026-03-05"), timeFrom: "08:30", timeTo: "12:00", hours: 3.5, reason: "ไปราชการ / ประชุมนอกสถานศึกษา", detail: "ประชุม สพป.", status: "pending", fiscalYear: 2026, half: 1 },
    ],
  });

  await prisma.holiday.createMany({
    data: [
      { date: D("2025-12-05"), name: "วันคล้ายวันพระบรมราชสมภพ ร.9" },
      { date: D("2025-12-10"), name: "วันรัฐธรรมนูญ" },
      { date: D("2025-12-31"), name: "วันสิ้นปี" },
      { date: D("2026-01-01"), name: "วันขึ้นปีใหม่" },
      { date: D("2026-04-06"), name: "วันจักรี" },
      { date: D("2026-04-13"), name: "วันสงกรานต์" },
      { date: D("2026-04-14"), name: "วันสงกรานต์" },
      { date: D("2026-04-15"), name: "วันสงกรานต์" },
    ],
  });

  console.log("✅ Seed complete: ครู 6 คน, ใบลา 13 รายการ, ทุเลา 4 รายการ");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
