'use client';

import { Trash2, Edit2 } from 'lucide-react';
import { Expense } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
  people: string[];
  onDelete: (expenseId: string) => void;
  onEdit?: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, people, onDelete, onEdit }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
        <p className="text-white/70">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Expenses</h2>
      <div className="space-y-3">
        {expenses.map((expense, index) => (
          <div
            key={expense.id}
            className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-semibold">{expense.description}</h3>
                  <span className="text-purple-400 font-bold">{formatCurrency(expense.amount)}</span>
                </div>
                <div className="text-sm text-white/70 space-y-1">
                  <p>
                    <span className="text-white/90">Paid by:</span> {expense.paidBy}
                  </p>
                  <p>
                    <span className="text-white/90">Split between:</span>{' '}
                    {expense.splitBetween.join(', ')}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(expense.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit expense"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(expense.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
