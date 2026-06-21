"use client";
import { useState, useEffect } from "react";
import { subscribeTransactions, subscribeCategories } from "@/lib/db";
import { Transaction, Category, MONTHS } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const fmt = (n: number) => n === 0 ? "—" : "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const pct = (n: number, prev: number) => {
  if (!prev || !n) return null;
  const diff = ((n - prev) / prev) * 100;
  return diff;
};

export default function MonthlyPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubTxs = subscribeTransactions(setTxs);
    const unsubCats = subscribeCategories(setCategories);
    return () => { unsubTxs(); unsubCats(); };
  }, []);

  const years = [...new Set(txs.map(t => new Date(t.date).getFullYear()))].sort((a,b)=>b-a);
  if (!years.includes(year) && years.length > 0) setYear(years[0]);

  const yearTxs = txs.filter(t => new Date(t.date).getFullYear() === year);

  const monthData = MONTHS.map(month => {
    const income   = yearTxs.filter(t => new Date(t.date).toLocaleString("en",{month:"long"}) === month && t.type === "Income").reduce((s,t)=>s+t.amount,0);
    const expenses = yearTxs.filter(t => new Date(t.date).toLocaleString("en",{month:"long"}) === month && t.type === "Expense").reduce((s,t)=>s+t.amount,0);
    return { month: month.slice(0,3), income, expenses, net: income - expenses };
  });

  const expenseCats = categories.filter(c => c.type === "Expense").map(c => c.name);

  const catMonthData = expenseCats.map(cat => {
    const monthly = MONTHS.map(month =>
      yearTxs.filter(t => new Date(t.date).toLocaleString("en",{month:"long"}) === month && t.type === "Expense" && t.category === cat)
              .reduce((s,t) => s + t.amount, 0)
    );
    const total = monthly.reduce((s, v) => s + v, 0);
    const avg   = monthly.filter(v => v > 0).length > 0
      ? total / monthly.filter(v => v > 0).length : 0;
    return { cat, monthly, total, avg };
  }).filter(r => r.total > 0);

  /* ── Download helpers ─────────────────────────────────────── */
  function downloadCSV() {
    const header = "Date,Category,Type,Account,Description,Amount\n";
    const rows = yearTxs
      .map(t => `${t.date},"${t.category}",${t.type},${t.account},"${t.description}",${t.amount}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPDF() {
    // Dynamically import jsPDF so it's only loaded when the user clicks
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Finance Report — ${year}`, 14, 20);

    // Monthly summary table
    doc.setFontSize(12);
    doc.text("Monthly Summary", 14, 35);

    let y = 42;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Month", 14, y);
    doc.text("Income", 55, y, { align: "right" });
    doc.text("Expenses", 90, y, { align: "right" });
    doc.text("Net", 125, y, { align: "right" });
    doc.text("Savings %", 160, y, { align: "right" });
    y += 2;
    doc.line(14, y, 170, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    monthData.forEach(m => {
      const savRate = m.income > 0 ? ((m.net / m.income) * 100).toFixed(1) + "%" : "—";
      doc.text(m.month, 14, y);
      doc.text(m.income > 0 ? `₹${m.income.toLocaleString("en-IN")}` : "—", 55, y, { align: "right" });
      doc.text(m.expenses > 0 ? `₹${m.expenses.toLocaleString("en-IN")}` : "—", 90, y, { align: "right" });
      doc.text(m.net !== 0 ? `₹${m.net.toLocaleString("en-IN")}` : "—", 125, y, { align: "right" });
      doc.text(savRate, 160, y, { align: "right" });
      y += 6;
    });

    // Category breakdown
    if (catMonthData.length > 0) {
      y += 8;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.text("Expense by Category", 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Category", 14, y);
      doc.text("Total", 100, y, { align: "right" });
      doc.text("Avg/Month", 140, y, { align: "right" });
      y += 2;
      doc.line(14, y, 150, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      catMonthData.forEach(row => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(row.cat, 14, y);
        doc.text(`₹${row.total.toLocaleString("en-IN")}`, 100, y, { align: "right" });
        doc.text(`₹${Math.round(row.avg).toLocaleString("en-IN")}`, 140, y, { align: "right" });
        y += 6;
      });
    }

    // Transaction list
    y += 8;
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.text("All Transactions", 14, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Date", 14, y);
    doc.text("Category", 45, y);
    doc.text("Type", 100, y);
    doc.text("Amount", 140, y, { align: "right" });
    y += 2;
    doc.line(14, y, 150, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    yearTxs.forEach(t => {
      if (y > 285) { doc.addPage(); y = 20; }
      doc.text(t.date, 14, y);
      doc.text(t.category, 45, y);
      doc.text(t.type, 100, y);
      doc.text(`₹${t.amount.toLocaleString("en-IN")}`, 140, y, { align: "right" });
      y += 5;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 14, 290);

    doc.save(`finance-report-${year}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Monthly Comparison</h1>
          <p className="text-sm text-gray-500">Month-by-month breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"/></svg>
            CSV
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3"/></svg>
            PDF
          </button>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {(years.length > 0 ? years : [year]).map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-black/5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Income vs Expenses — {year}</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthData} barSize={20}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(Number(v))} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#17A589" radius={[4,4,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#C0392B" radius={[4,4,0,0]} />
            <Bar dataKey="net" name="Net" fill="#4472C4" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly summary table */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-auto">
        <div className="px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-gray-700">Monthly Summary</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#2D4A8A] text-white text-xs">
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-right">Income</th>
              <th className="px-4 py-3 text-right">Expenses</th>
              <th className="px-4 py-3 text-right">Net</th>
              <th className="px-4 py-3 text-right">Savings %</th>
              <th className="px-4 py-3 text-right">vs Prev Income</th>
              <th className="px-4 py-3 text-right">vs Prev Exp</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {monthData.map((m, i) => {
              const prevInc = i > 0 ? monthData[i-1].income : 0;
              const prevExp = i > 0 ? monthData[i-1].expenses : 0;
              const incChg  = pct(m.income, prevInc);
              const expChg  = pct(m.expenses, prevExp);
              const savRate = m.income > 0 ? (m.net / m.income * 100) : null;
              return (
                <tr key={m.month} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-semibold text-gray-800">{MONTHS[i].slice(0,3)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{fmt(m.income)}</td>
                  <td className="px-4 py-3 text-right text-red-600 font-medium">{fmt(m.expenses)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${m.net >= 0 ? "text-emerald-700" : "text-red-700"}`}>{fmt(m.net)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {savRate !== null ? `${savRate.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {incChg !== null ? (
                      <span className={`text-xs font-semibold ${incChg >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {incChg >= 0 ? "+" : ""}{incChg.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {expChg !== null ? (
                      <span className={`text-xs font-semibold ${expChg <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {expChg >= 0 ? "+" : ""}{expChg.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Category breakdown table */}
      {catMonthData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-auto">
          <div className="px-5 py-4 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Expense by Category — Month Wise</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#1A1F3A] text-white">
                  <th className="px-4 py-3 text-left sticky left-0 bg-[#1A1F3A]">Category</th>
                  {MONTHS.map(m => <th key={m} className="px-3 py-3 text-right">{m.slice(0,3)}</th>)}
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {catMonthData.map((row, i) => (
                  <tr key={row.cat} className={i % 2 === 0 ? "bg-white" : "bg-orange-50"}>
                    <td className="px-4 py-2.5 font-medium text-gray-700 sticky left-0 bg-inherit">{row.cat}</td>
                    {row.monthly.map((v, mi) => (
                      <td key={mi} className={`px-3 py-2.5 text-right ${v > 0 ? "text-gray-800" : "text-gray-200"}`}>
                        {v > 0 ? fmt(v) : "—"}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right font-bold text-red-700">{fmt(row.total)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{fmt(row.avg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
