
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  categoryId: string | null;
  date: string; // ISO string
  note: string;
  receipt?: string; // base64 data URL
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
}
