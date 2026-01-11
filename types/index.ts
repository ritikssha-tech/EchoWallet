export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  timestamp: number;
}

export interface Room {
  id: string;
  name?: string;
  expenses: Expense[];
  createdAt: number;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export interface Person {
  name: string;
  balance: number;
}
