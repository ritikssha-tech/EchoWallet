'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Expense } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ExpenseFormProps {
  people: string[];
  onSubmit: (expense: Expense) => void;
}

export default function ExpenseForm({ people, onSubmit }: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (people.length > 0 && !paidBy) {
      setPaidBy(people[0]);
    }
  }, [people, paidBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || splitBetween.size === 0) {
      return;
    }

    const expense: Expense = {
      id: uuidv4(),
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitBetween: Array.from(splitBetween),
      timestamp: Date.now(),
    };

    onSubmit(expense);
    
    // Reset form
    setDescription('');
    setAmount('');
    setSplitBetween(new Set());
    if (people.length > 0) {
      setPaidBy(people[0]);
    }
  };

  const togglePerson = (person: string) => {
    const newSet = new Set(splitBetween);
    if (newSet.has(person)) {
      newSet.delete(person);
    } else {
      newSet.add(person);
    }
    setSplitBetween(newSet);
  };

  const selectAll = () => {
    setSplitBetween(new Set(people));
  };

  const selectNone = () => {
    setSplitBetween(new Set());
  };

  if (people.length === 0) {
    return (
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6">
        <p className="text-white/70 text-center">Add an expense to get started!</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/80 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Dinner at restaurant"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Paid By
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              {people.map((person) => (
                <option key={person} value={person} className="bg-gray-900">
                  {person}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-white/80">
              Split Between
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Select All
              </button>
              <span className="text-white/50">|</span>
              <button
                type="button"
                onClick={selectNone}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {people.map((person) => (
              <button
                key={person}
                type="button"
                onClick={() => togglePerson(person)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  splitBetween.has(person)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'
                }`}
              >
                {person}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </form>
    </div>
  );
}
