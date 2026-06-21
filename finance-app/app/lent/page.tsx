"use client";
import { useState, useEffect } from "react";
import { subscribeLent, deleteLent } from "@/lib/db";
import { LentEntry } from "@/lib/types";
import LentModal from "../components/LentModal";
import { Plus, Pencil, Trash2, HandCoins } from "lucide-react";

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusStyle: Record<string, string> = {
  Unpaid:  "bg-red-100 text-red-700",
  Partial: "bg-amber-100 text-amber-700",
  Paid:    "bg-emerald-100 text-emerald-700",
};

export default function LentPage() {
  const [lents, setLents] = useState<LentEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LentEntry | null>(null);
  const [filter, setFilter] = useState<"All"|"Unpaid"|"Partial"|"Paid">("All");

  useEffect(() => subscribeLent(setLents), []);

  const totalLent   = lents.reduce((s, l) => s + l.amountLent, 0);
  const stillOwed   = lents.filter(l => l.status !== "Paid").reduce((s, l) => s + (l.amountLent - l.amountRepaid), 0);
  const recovered   = lents.filter(l => l.status === "Paid").reduce((s, l) => s + l.amountLent, 0);
  const partialRecovered = lents.filter(l => l.status === "Partial").reduce((s, l) => s + l.amountRepaid, 0);

  const filtered = lents.filter(l => filter === "All" || l.status === filter);

  async function handleDelete(id: string) {
    if (confirm("Delete this entry?")) await deleteLent(id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Money Lent</h1>
          <p className="text-sm text-gray-500">Track who owes you</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-800 transition">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Lent", value: fmt(totalLent), color: "bg-purple-50" },
          { label: "Still Owed", value: fmt(stillOwed), color: "bg-red-50" },
          { label: "Fully Recovered", value: fmt(recovered), color: "bg-emerald-50" },
          { label: "Partial Received", value: fmt(partialRecovered), color: "bg-amber-50" },
        ].map(k => (
          <div key={k.label} className={`${k.color} rounded-xl p-4 shadow-sm border border-black/5`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{k.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["All","Unpaid","Partial","Paid"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition
              ${filter === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-purple-700 text-white text-xs">
              <th className="px-4 py-3 text-left">Friend</th>
              <th className="px-4 py-3 text-left">Date Lent</th>
              <th className="px-4 py-3 text-right">Lent</th>
              <th className="px-4 py-3 text-left">Lent From</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Repaid</th>
              <th className="px-4 py-3 text-right">Balance Owed</th>
              <th className="px-4 py-3 text-left">Credited To</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-12 text-gray-300">
                <HandCoins className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No entries yet
              </td></tr>
            )}
            {filtered.map((l, i) => {
              const balance = l.amountLent - l.amountRepaid;
              return (
                <tr key={l.id} className={i % 2 === 0 ? "bg-white" : "bg-purple-50/30"}>
                  <td className="px-4 py-3 font-semibold text-gray-800">{l.friendName}</td>
                  <td className="px-4 py-3 text-gray-500">{l.dateLent}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(l.amountLent)}</td>
                  <td className="px-4 py-3">
                    {l.accountDebited ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${l.accountDebited === "IOB" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {l.accountDebited}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusStyle[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                    {l.amountRepaid > 0 ? fmt(l.amountRepaid) : "—"}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${balance > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {fmt(balance)}
                  </td>
                  <td className="px-4 py-3">
                    {l.accountCredited ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${l.accountCredited === "IOB" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {l.accountCredited}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{l.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditing(l); setShowModal(true); }}
                        className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(l.id!)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && <LentModal onClose={() => { setShowModal(false); setEditing(null); }} editing={editing} />}
    </div>
  );
}
