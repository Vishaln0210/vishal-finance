"use client";
import { useState, useEffect } from "react";
import { subscribeTransactions, deleteTransaction } from "@/lib/db";
import { Transaction } from "@/lib/types";
import TransactionModal from "../components/TransactionModal";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function TransactionsPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Income" | "Expense">("All");
  const [filterAccount, setFilterAccount] = useState<"All" | "IOB" | "HDFC">("All");

  useEffect(() => subscribeTransactions(setTxs), []);

  const filtered = txs.filter(t => {
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || t.type === filterType;
    const matchAcc  = filterAccount === "All" || t.account === filterAccount;
    return matchSearch && matchType && matchAcc;
  });

  async function handleDelete(id: string) {
    if (confirm("Delete this transaction?")) await deleteTransaction(id);
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Transactions</h1>
          <p className="text-xs md:text-sm text-gray-500">{filtered.length} entries</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center justify-center gap-2 bg-[#1A1F3A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2D4A8A] transition w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-black/5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search description or category…"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["All","Income","Expense"] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition
                  ${filterType === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["All","IOB","HDFC"] as const).map(a => (
              <button key={a} onClick={() => setFilterAccount(a)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition
                  ${filterAccount === a ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>{a}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1A1F3A] text-white text-xs">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-gray-300">No transactions found</td></tr>
            )}
            {filtered.map((t, i) => (
              <tr key={t.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-gray-600">{t.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                    ${t.type === "Income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${t.account === "IOB" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    {t.account}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{t.category}</td>
                <td className="px-4 py-3 text-gray-500">{t.description || "—"}</td>
                <td className={`px-4 py-3 text-right font-semibold
                  ${t.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                  {t.type === "Income" ? "+" : "-"}{fmt(t.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setEditing(t); setShowModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id!)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-300 bg-white rounded-xl shadow-sm border border-black/5">No transactions found</div>
        )}
        {filtered.map((t) => (
          <div key={t.id} className="mobile-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                    ${t.type === "Income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {t.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold
                    ${t.account === "IOB" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                    {t.account}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{t.description || t.category}</p>
                <p className="text-[11px] text-gray-400">{t.category} · {t.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${t.type === "Income" ? "text-emerald-600" : "text-red-600"}`}>
                  {t.type === "Income" ? "+" : "-"}{fmt(t.amount)}
                </p>
                <div className="flex gap-1 mt-1.5 justify-end">
                  <button onClick={() => { setEditing(t); setShowModal(true); }}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-500">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(t.id!)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && <TransactionModal onClose={() => { setShowModal(false); setEditing(null); }} editing={editing} />}
    </div>
  );
}
