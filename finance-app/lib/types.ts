export type TxType = "Income" | "Expense";
export type Account = "IOB" | "HDFC";
export type LentStatus = "Unpaid" | "Partial" | "Paid";

export interface Transaction {
  id?: string;
  date: string;       // YYYY-MM-DD
  type: TxType;
  account: Account;
  category: string;
  description: string;
  amount: number;
}

export interface LentEntry {
  id?: string;
  friendName: string;
  dateLent: string;     // YYYY-MM-DD
  amountLent: number;
  accountDebited?: Account;  // bank account from which money was lent
  status: LentStatus;
  amountRepaid: number;
  repaidDate?: string;
  accountCredited?: Account;
  notes?: string;
}

export interface Category {
  id?: string;
  name: string;
  type: TxType;
}

export const INCOME_CATS = [
  "Salary","Freelance","Investments","Gifts","Refunds","Bonus","Rental Income","Other Income",
];
export const EXPENSE_CATS = [
  "Housing","Utilities","Groceries","Transportation","Dining Out","Entertainment",
  "Healthcare","Insurance","Personal Care","Debt Repayment","Savings","Education",
  "Gifts/Donations","Subscriptions","Travel","Miscellaneous","Clothing","Pets","Childcare",
];
export const ACCOUNTS: Account[] = ["IOB","HDFC"];
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
