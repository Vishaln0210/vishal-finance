"use client";
import { db } from "./firebase";
import {
  collection, addDoc, updateDoc, deleteDoc,
  deleteField, doc, onSnapshot, query, orderBy,
} from "firebase/firestore";
import { Transaction, LentEntry } from "./types";

function omitUndefined<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  );
}

function undefinedAsDelete<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      value === undefined ? deleteField() : value,
    ])
  );
}

// ── Transactions ─────────────────────────────────────────────────────────────
export function subscribeTransactions(cb: (data: Transaction[]) => void) {
  const q = query(collection(db, "transactions"), orderBy("date", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction)))
  );
}

export async function addTransaction(tx: Omit<Transaction, "id">) {
  await addDoc(collection(db, "transactions"), tx);
}

export async function updateTransaction(id: string, tx: Partial<Transaction>) {
  await updateDoc(doc(db, "transactions", id), tx);
}

export async function deleteTransaction(id: string) {
  await deleteDoc(doc(db, "transactions", id));
}

// ── Lent Entries ─────────────────────────────────────────────────────────────
export function subscribeLent(cb: (data: LentEntry[]) => void) {
  const q = query(collection(db, "lent"), orderBy("dateLent", "desc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LentEntry)))
  );
}

export async function addLent(entry: Omit<LentEntry, "id">) {
  await addDoc(collection(db, "lent"), omitUndefined(entry));
}

export async function updateLent(id: string, entry: Partial<LentEntry>) {
  await updateDoc(doc(db, "lent", id), undefinedAsDelete(entry));
}

export async function deleteLent(id: string) {
  await deleteDoc(doc(db, "lent", id));
}

// ── Categories ─────────────────────────────────────────────────────────────
export function subscribeCategories(cb: (data: import('./types').Category[]) => void) {
  const q = query(collection(db, "categories"), orderBy("name", "asc"));
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as import('./types').Category)))
  );
}

export async function addCategory(category: Omit<import('./types').Category, "id">) {
  await addDoc(collection(db, "categories"), omitUndefined(category));
}

export async function updateCategory(id: string, category: Partial<import('./types').Category>) {
  await updateDoc(doc(db, "categories", id), undefinedAsDelete(category));
}

export async function deleteCategory(id: string) {
  await deleteDoc(doc(db, "categories", id));
}
