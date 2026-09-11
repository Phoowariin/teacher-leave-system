"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";

type D = { name: string; value: number; fill: string };

export default function LeaveChart({ data, donut }: { data: D[]; donut: D[] }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm lg:col-span-2">
        <div className="font-semibold mb-3 text-sm">จำนวนวันลาแยกตามประเภท</div>
        {data.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
            ยังไม่มีข้อมูลการลา
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v: number) => [`${v} วัน`, "จำนวน"]} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="font-semibold mb-3 text-sm">สถานะตามเกณฑ์เลื่อนเงินเดือน</div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={donut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label>
              {donut.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => [`${v} คน`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
