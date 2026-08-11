"use client";

import { useMounted } from "@/lib/hooks/useMounted";
import { useStore } from "@/lib/store";
import { formatMoney } from "@/lib/currency";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E8BAFF', '#FFBADD', '#D3D3D3', '#C1F0F6'];

export default function AnalyticsPage() {
  const mounted = useMounted();
  const { expenses, categories, currency, month } = useStore();

  if (!mounted) return null;

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(month));

  // Aggregate by category
  const dataMap = new Map<string, number>();
  currentMonthExpenses.forEach(exp => {
    const current = dataMap.get(exp.category) || 0;
    dataMap.set(exp.category, current + exp.amount);
  });

  const chartData = Array.from(dataMap.entries()).map(([catId, amount]) => {
    const category = categories.find(c => c.id === catId);
    return {
      name: category ? category.label : catId,
      value: amount,
      color: category?.color
    };
  }).sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline/20 p-3 rounded-xl shadow-sm text-on-surface">
          <p className="font-label-md font-bold">{payload[0].name}</p>
          <p className="font-body-md">{formatMoney(payload[0].value, currency as any)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="relative w-full pt-20 pb-24 bg-surface min-h-screen">
      <div className="flex flex-col w-full p-container-padding max-w-[480px] mx-auto gap-6">
        <h1 className="font-headline-md text-primary text-center">Analitik Bulan Ini</h1>

        {chartData.length > 0 ? (
          <div className="bg-surface-container rounded-3xl p-6 shadow-sm border border-outline/10 flex flex-col items-center">
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'var(--font-quicksand)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="font-body-md text-on-surface-variant text-sm mt-4 text-center">
              Ketuk potongan diagram untuk melihat detail pengeluaran.
            </p>
          </div>
        ) : (
          <div className="bg-surface-container rounded-3xl p-8 flex flex-col items-center justify-center border border-outline/10 border-dashed">
            <span className="material-symbols-outlined text-[48px] text-outline/40 mb-3">pie_chart</span>
            <p className="font-body-md text-on-surface-variant text-center">
              Belum ada pengeluaran bulan ini.
            </p>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="bg-surface rounded-2xl p-5 shadow-sm border border-outline/10">
            <h2 className="font-headline-sm text-on-surface mb-4">Pengeluaran Terbesar</h2>
            <div className="flex flex-col gap-3">
              {chartData.map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-3 border-b border-outline/10 last:border-0 last:pb-0">
                  <span className="font-body-md text-on-surface">{item.name}</span>
                  <span className="font-label-md font-bold text-primary">{formatMoney(item.value, currency as any)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
