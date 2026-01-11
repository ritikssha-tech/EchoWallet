'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Debt } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface DebtSettlementProps {
  debts: Debt[];
}

export default function DebtSettlement({ debts }: DebtSettlementProps) {
  if (debts.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 text-green-400">
          <CheckCircle2 className="w-6 h-6" />
          <h2 className="text-xl font-semibold">All Settled!</h2>
        </div>
        <p className="text-white/70 mt-2">No outstanding debts. Everyone is even.</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Simplified Settlements</h2>
      <p className="text-white/70 text-sm mb-4">
        Minimum transactions needed to settle all debts:
      </p>
      <div className="space-y-3">
        {debts.map((debt, index) => (
          <div
            key={index}
            className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-white font-semibold">{debt.from}</div>
                <ArrowRight className="w-5 h-5 text-purple-400" />
                <div className="text-white font-semibold">{debt.to}</div>
              </div>
              <div className="text-purple-400 font-bold text-lg">
                {formatCurrency(debt.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <p className="text-purple-300 text-sm">
          💡 This algorithm minimizes the number of transactions needed to settle all debts.
        </p>
      </div>
    </div>
  );
}
