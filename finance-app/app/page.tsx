"use client";
import { useState, useEffect } from "react";
import { subscribeTransactions, subscribeLent } from "@/lib/db";
import { Transaction, LentEntry, MONTHS } from "@/lib/types";
import KpiCard from "./components/KpiCard";
import TransactionModal from "./components/TransactionModal";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { Plus, TrendingUp, TrendingDown, Wallet, HandCoins } from "lucide-react";

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = ["#4472C4","#17A589","#E67E22","#C0392B","#6C3483","#2E86C1","#1E8449","#D4AC0D"];

export default function DashboardPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [lents, setLents] = useState<LentEntry[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const u1 = subscribeTransactions(setTxs);
    const u2 = subscribeLent(setLents);
    return () => { u1(); u2(); };
  }, []);

  const totalIncome   = txs.filter(t => t.type === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txs.filter(t => t.type === "Expense").reduce((s, t) => s + t.amount, 0);
  const netSavings    = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const iobBase  = txs.filter(t => t.account === "IOB").reduce((s, t) => s + (t.type === "Income" ? t.amount : -t.amount), 0);
  const hdfcBase = txs.filter(t => t.account === "HDFC").reduce((s, t) => s + (t.type === "Income" ? t.amount : -t.amount), 0);
  const iobLent    = lents.filter(l => l.accountDebited === "IOB").reduce((s, l) => s + l.amountLent, 0);
  const hdfcLent   = lents.filter(l => l.accountDebited === "HDFC").reduce((s, l) => s + l.amountLent, 0);
  const iobRepaid  = lents.filter(l => l.accountCredited === "IOB"  && (l.status === "Paid" || l.status === "Partial")).reduce((s, l) => s + l.amountRepaid, 0);
  const hdfcRepaid = lents.filter(l => l.accountCredited === "HDFC" && (l.status === "Paid" || l.status === "Partial")).reduce((s, l) => s + l.amountRepaid, 0);
  const iobBal  = iobBase  - iobLent  + iobRepaid;
  const hdfcBal = hdfcBase - hdfcLent + hdfcRepaid;
  const totalCurrentBalance = iobBal + hdfcBal;

  const totalLent = lents.reduce((s, l) => s + l.amountLent, 0);
  const stillOwed = lents.filter(l => l.status !== "Paid").reduce((s, l) => s + (l.amountLent - l.amountRepaid), 0);

  const monthlyData = MONTHS.map((month) => {
    const income   = txs.filter(t => new Date(t.date).toLocaleString("en",{month:"long"}) === month && t.type === "Income").reduce((s,t)=>s+t.amount,0);
    const expenses = txs.filter(t => new Date(t.date).toLocaleString("en",{month:"long"}) === month && t.type === "Expense").reduce((s,t)=>s+t.amount,0);
    return { month: month.slice(0,3), income, expenses, net: income - expenses };
  });

  const catData = txs
    .filter(t => t.type === "Expense")
    .reduce((acc, t) => {
      const ex = acc.find(x => x.name === t.category);
      if (ex) ex.value += t.amount; else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value).slice(0, 8);

  const recent = txs.slice(0, 8);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500">Your financial overview</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1A1F3A] text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-[#2D4A8A] transition">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Transaction</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard label="Total Income" value={fmt(totalIncome)} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
        <KpiCard label="Total Expenses" value={fmt(totalExpenses)} icon={<TrendingDown className="w-4 h-4 text-red-500" />} />
        <KpiCard label="Net Savings" value={fmt(netSavings)} sub={`${savingsRate.toFixed(1)}% savings rate`} color={netSavings >= 0 ? "bg-emerald-50" : "bg-red-50"} />
        <KpiCard label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} color="bg-blue-50" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        <KpiCard label="Current Balance" value={fmt(totalCurrentBalance)} color="bg-emerald-50" icon={<Wallet className="w-4 h-4 text-emerald-600" />} />
        <KpiCard label="IOB Balance" value={fmt(iobBal)} color="bg-blue-50" icon={<Wallet className="w-4 h-4 text-blue-500" />} />
        <KpiCard label="HDFC Balance" value={fmt(hdfcBal)} color="bg-orange-50" icon={<Wallet className="w-4 h-4 text-orange-500" />} />
        <KpiCard label="Total Lent Out" value={fmt(totalLent)} color="bg-purple-50" icon={<HandCoins className="w-4 h-4 text-purple-600" />} />
        <KpiCard label="Still Owed" value={fmt(stillOwed)} color="bg-red-50" sub="Go to Money Lent →" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-4 md:p-5 shadow-sm border border-black/5">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-3 md:mb-4">Income vs Expenses by Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={14}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="income" name="Income" fill="#17A589" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#C0392B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-black/5">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-3 md:mb-4">Expense Breakdown</h3>
          {catData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No expenses yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ percent }) => `${((percent ?? 0)*100).toFixed(0)}%`} fontSize={10}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-black/5">
        <h3 className="text-xs md:text-sm font-semibold text-gray-700 mb-3 md:mb-4">Net Savings Trend</h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(Number(v))} />
            <Line type="monotone" dataKey="net" name="Net" stroke="#2D4A8A" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-black/5">
        <div className="px-4 md:px-5 py-3 md:py-4 border-b flex items-center justify-between">
          <h3 className="text-xs md:text-sm font-semibold text-gray-700">Recent Transactions</h3>
          <a href="/transactions" className="text-xs text-blue-600 hover:underline">View all →</a>
        </div>
        <div className="divide-y">
          {recent.length === 0 && <p className="text-center text-gray-300 py-8 text-sm">No transactions yet</p>}
          {recent.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 md:px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${t.type === "Income" ? "bg-emerald-500" : "bg-red-500"}`} />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium truncate">{t.description || t.category}</p>
                  <p className="text-[10px] md:text-xs text-gray-400 truncate">{t.category} · {t.account} · {t.date}</p>
                </div>
              </div>
              <span className={`text-xs md:text-sm font-semibold whitespace-nowrap ml-3 ${t.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                {t.type === "Income" ? "+" : "-"}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
