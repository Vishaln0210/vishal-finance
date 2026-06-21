"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { LentEntry, LentStatus, Account, ACCOUNTS } from "@/lib/types";
import { addLent, updateLent } from "@/lib/db";

interface Props {
  onClose: () => void;
  editing?: LentEntry | null;
}

function initialForm(editing?: LentEntry | null): Omit<LentEntry, "id"> {
  if (editing) {
    const { id: _id, ...rest } = editing;
    return rest;
  }
  return {
    friendName: "",
    dateLent: new Date().toISOString().slice(0, 10),
    amountLent: 0,
    accountDebited: undefined,
    status: "Unpaid",
    amountRepaid: 0,
    repaidDate: "",
    accountCredited: undefined,
    notes: "",
  };
}

export default function LentModal({ onClose, editing }: Props) {
  const [form, setForm] = useState<Omit<LentEntry, "id">>(() => initialForm(editing));

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { ...form };
    if (data.status === "Unpaid") {
      data.amountRepaid = 0;
      data.repaidDate = undefined;
      data.accountCredited = undefined;
    } else if (!data.accountCredited) {
      data.accountCredited = undefined;
    }
    if (editing?.id) await updateLent(editing.id, data);
    else await addLent(data);
    onClose();
  }

  const showRepaid = form.status === "Partial" || form.status === "Paid";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">{editing ? "Edit" : "Add"} Lent Entry</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Friend&apos;s Name</label>
            <input required value={form.friendName}
              onChange={(e) => set("friendName", e.target.value)}
              placeholder="Who did you lend to?"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Date Lent</label>
              <input type="date" required value={form.dateLent}
                onChange={(e) => set("dateLent", e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Amount (₹)</label>
              <input type="number" required min={1} step={0.01} value={form.amountLent || ""}
                onChange={(e) => set("amountLent", parseFloat(e.target.value))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>

          {/* Lent from account (optional) */}
          <div>
            <label className="text-xs font-medium text-gray-500">Lent From Account <span className="text-gray-300">(optional)</span></label>
            <select value={form.accountDebited || ""}
              onChange={(e) => set("accountDebited", e.target.value ? e.target.value as Account : undefined)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">No specific account</option>
              {ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
            <div className="flex gap-2">
              {(["Unpaid","Partial","Paid"] as LentStatus[]).map((s) => (
                <button key={s} type="button" onClick={() => set("status", s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition
                    ${form.status === s
                      ? s === "Paid" ? "bg-emerald-500 text-white"
                        : s === "Partial" ? "bg-amber-400 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {showRepaid && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Amount Repaid (₹)</label>
                  <input type="number" min={0} step={0.01} value={form.amountRepaid || ""}
                    onChange={(e) => set("amountRepaid", parseFloat(e.target.value))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Repaid Date</label>
                  <input type="date" value={form.repaidDate || ""}
                    onChange={(e) => set("repaidDate", e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Account Credited</label>
                <select value={form.accountCredited || ""}
                  onChange={(e) => set("accountCredited", e.target.value ? e.target.value as Account : undefined)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <option value="">Select account…</option>
                  {ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500">Notes</label>
            <input value={form.notes || ""} onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional note…"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border rounded-lg py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="flex-1 bg-purple-700 text-white rounded-lg py-2 text-sm font-semibold hover:bg-purple-800 transition">
              {editing ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
