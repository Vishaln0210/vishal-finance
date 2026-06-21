"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Transaction, Category, ACCOUNTS, TxType, Account } from "@/lib/types";
import { addTransaction, updateTransaction, subscribeCategories } from "@/lib/db";

interface Props {
  onClose: () => void;
  editing?: Transaction | null;
}

function initialForm(editing?: Transaction | null): Omit<Transaction, "id"> {
  if (editing) {
    const { id: _id, ...rest } = editing;
    return rest;
  }
  return {
    date: new Date().toISOString().slice(0, 10),
    type: "Expense",
    account: "IOB",
    category: "",
    description: "",
    amount: 0,
  };
}

export default function TransactionModal({ onClose, editing }: Props) {
  const [form, setForm] = useState<Omit<Transaction, "id">>(() => initialForm(editing));
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => subscribeCategories(setDbCategories), []);

  const cats = dbCategories.filter(c => c.type === form.type).map(c => c.name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing?.id) {
      await updateTransaction(editing.id, form);
    } else {
      await addTransaction(form);
    }
    onClose();
  }

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">{editing ? "Edit" : "Add"} Transaction</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {(["Income", "Expense"] as TxType[]).map((t) => (
              <button
                key={t} type="button"
                onClick={() => { set("type", t); set("category", ""); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                  ${form.type === t
                    ? t === "Income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >{t}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Date</label>
              <input type="date" required value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Account</label>
              <select value={form.account} onChange={(e) => set("account", e.target.value as Account)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                {ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Category</label>
            <select required value={form.category} onChange={(e) => set("category", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select category…</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Description</label>
            <input type="text" value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="What was this for?"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Amount (₹)</label>
            <input type="number" required min={0.01} step={0.01} value={form.amount || ""}
              onChange={(e) => set("amount", parseFloat(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-[#1A1F3A] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#2D4A8A] transition">
              {editing ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
