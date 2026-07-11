import { useState } from "react";

export default function RevenueChart() {
  const [monthlyData] = useState([
    { month: "Jan", revenue: 65000 },
    { month: "Feb", revenue: 75000 },
    { month: "Mar", revenue: 85000 },
    { month: "Apr", revenue: 95000 },
    { month: "May", revenue: 80000 },
    { month: "Jun", revenue: 120000 },
    { month: "Jul", revenue: 134789 },
    { month: "Aug", revenue: 110000 },
    { month: "Sep", revenue: 125000 },
  ]);

  return (
    <div className="mt-6 rounded-[32px] bg-white p-6 shadow-sm shadow-slate-200/40">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Monthly Revenue</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">₹134,789</h2>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
          +5.4% vs last month
        </span>
      </div>

      <div className="mt-6 h-72 rounded-[24px] bg-slate-50 p-6">
        <div className="h-full flex items-end justify-around gap-2">
          {monthlyData.map((item, idx) => {
            const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
            const height = (item.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="relative w-8 h-48 bg-slate-200 rounded-full flex items-end justify-center hover:shadow-lg transition">
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-full"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 font-medium">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-[16px] bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Total Profit</p>
          <p className="text-lg font-bold text-slate-900 mt-1">₹245,600</p>
        </div>
        <div className="rounded-[16px] bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Average Income</p>
          <p className="text-lg font-bold text-slate-900 mt-1">₹104,210</p>
        </div>
        <div className="rounded-[16px] bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Total Expenses</p>
          <p className="text-lg font-bold text-slate-900 mt-1">₹156,500</p>
        </div>
      </div>
    </div>
  );
}
