"use client";
import { useState, useEffect } from "react";
import { subscribeTransactions, subscribeCategories, addCategory, updateCategory, deleteCategory } from "@/lib/db";
import { Transaction, Category, ACCOUNTS, TxType } from "@/lib/types";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CategoriesPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catType, setCatType] = useState<TxType>("Expense");

  useEffect(() => {
    const unsubTxs = subscribeTransactions(setTxs);
    const unsubCats = subscribeCategories(setCategories);
    return () => { unsubTxs(); unsubCats(); };
  }, []);

  const expenseTotal = txs.filter(t => t.type === "Expense").reduce((s,t)=>s+t.amount,0);

  const catStats = (cats: Category[], type: TxType) =>
    cats.filter(c => c.type === type).map(c => {
      const items = txs.filter(t => t.type === type && t.category === c.name);
      const total = items.reduce((s,t)=>s+t.amount,0);
      return { id: c.id, name: c.name, type: c.type, total, count: items.length };
    }).sort((a,b) => b.total - a.total);

  const expenseStats = catStats(categories, "Expense");
  const incomeStats  = catStats(categories, "Income");

  const openAdd = (type: TxType) => {
    setEditingCat(null);
    setCatType(type);
    setCatName("");
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCat(c);
    setCatType(c.type);
    setCatName(c.name);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the category "${name}"? Transactions using this category will remain but will be uncategorized in reports.`)) {
      if (id) await deleteCategory(id);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    
    try {
      if (editingCat?.id) {
        await updateCategory(editingCat.id, { name: catName.trim(), type: catType });
      } else {
        await addCategory({ name: catName.trim(), type: catType });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving category:", error);
      alert(`Failed to save category. Please ensure your Firestore rules allow access to the 'categories' collection.\n\nError details: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Categories</h1>
          <p className="text-xs md:text-sm text-gray-500">Manage your categories & view usage</p>
        </div>
        <button onClick={() => openAdd("Expense")} className="bg-[#1A1F3A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2D4A8A] flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense categories */}
        <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b bg-red-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-red-700">Expense Categories</h3>
            <button onClick={() => openAdd("Expense")} className="text-red-600 hover:text-red-800"><Plus className="w-4 h-4" /></button>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {expenseStats.map((s, i) => (
                <tr key={s.id || s.name} className={`group ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="px-5 py-2.5 text-gray-700 font-medium">{s.name}</td>
                  <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{s.count} txns</td>
                  <td className="px-5 py-2.5 text-right font-semibold text-red-600 w-24">
                    {s.total > 0 ? fmt(s.total) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-right text-gray-400 text-xs w-16">
                    {expenseTotal > 0 && s.total > 0 ? `${((s.total/expenseTotal)*100).toFixed(1)}%` : ""}
                  </td>
                  <td className="px-5 py-2.5 w-16 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s as Category)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id!, s.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
              {expenseStats.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-sm">No expense categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Income categories */}
        <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
          <div className="px-5 py-4 border-b bg-emerald-50 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-emerald-700">Income Categories</h3>
            <button onClick={() => openAdd("Income")} className="text-emerald-600 hover:text-emerald-800"><Plus className="w-4 h-4" /></button>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {incomeStats.map((s, i) => (
                <tr key={s.id || s.name} className={`group ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="px-5 py-2.5 text-gray-700 font-medium">{s.name}</td>
                  <td className="px-5 py-2.5 text-right text-gray-400 text-xs">{s.count} txns</td>
                  <td className="px-5 py-2.5 text-right font-semibold text-emerald-600 w-24">
                    {s.total > 0 ? fmt(s.total) : "—"}
                  </td>
                  <td className="px-5 py-2.5 w-16 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s as Category)} className="text-blue-600 hover:text-blue-800"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(s.id!, s.name)} className="text-red-600 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
              {incomeStats.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500 text-sm">No income categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounts */}
      <div className="bg-white rounded-xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-5 py-4 border-b bg-blue-50">
          <h3 className="text-sm font-semibold text-blue-700">Accounts</h3>
        </div>
        <div className="p-5 flex gap-3">
          {ACCOUNTS.map(a => (
            <span key={a} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">{a}</span>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-lg">{editingCat ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Type</label>
                <div className="flex gap-2 mt-1">
                  {(["Income", "Expense"] as TxType[]).map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => setCatType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                        ${catType === t
                          ? t === "Income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Name</label>
                <input type="text" required value={catName} autoFocus
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#1A1F3A] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#2D4A8A] transition">
                  {editingCat ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
