# ระบบแจ้งลาข้าราชการครู สังกัด สพฐ.

Next.js 15 + Prisma + PostgreSQL (Supabase) + Vercel

## คุณสมบัติ
- แดชบอร์ดสรุปการลาพร้อมกราฟ
- แดชบอร์ดเกณฑ์เลื่อนเงินเดือน (ลาป่วย+ลากิจ ไม่เกิน 6 ครั้ง / 23 วันทำการ ต่อครึ่งปีงบประมาณ)
- ประเภทการลาครบ 12 ประเภทตามระเบียบสำนักนายกฯ พ.ศ. 2555
- ระบบขออนุญาต (ทุเลา) นับเป็นชั่วโมง
- นับวันทำการอัตโนมัติ (ตัดเสาร์-อาทิตย์และวันหยุดราชการ)
- ล็อกสิทธิลาพักผ่อนสำหรับครูสายผู้สอน

## ติดตั้ง

    npm install

## ตั้งค่าฐานข้อมูล

1. สร้างโปรเจคที่ https://supabase.com (Region: Singapore)
2. กดปุ่ม Connect > แท็บ ORMs > เลือก Prisma
3. คัดลอกค่ามาสร้างไฟล์ .env

       DATABASE_URL="...:6543/postgres?pgbouncer=true&connection_limit=1"
       DIRECT_URL="...:5432/postgres"

4. สร้างตารางและใส่ข้อมูลตัวอย่าง

       npx prisma db push
       npm run db:seed

## รันในเครื่อง

    npm run dev

เปิด http://localhost:3000

## Deploy ขึ้น Vercel

1. push โค้ดขึ้น GitHub
2. เข้า https://vercel.com/new แล้ว Import repo
3. ก่อนกด Deploy ให้ใส่ Environment Variables: DATABASE_URL และ DIRECT_URL
4. Settings > Functions > Region: Singapore (sin1)

## ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|---|---|
| Can't reach database | ใช้ host ที่ลงท้าย .pooler.supabase.com |
| prepared statement already exists | ต้องมี ?pgbouncer=true ท้าย DATABASE_URL |
| รหัสผ่านมีอักขระพิเศษ | URL-encode เช่น @ เป็น %40 |
| Deploy แล้ว 500 | ใส่ env ใน Vercel แล้วกด Redeploy |
