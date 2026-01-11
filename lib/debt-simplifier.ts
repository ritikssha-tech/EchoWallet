import { Room, Debt, Person } from '@/types';
import { getAllPeople } from './storage';

export function calculateDebts(room: Room): Debt[] {
  if (room.expenses.length === 0) return [];

  const people = getAllPeople(room);
  const balances: Map<string, number> = new Map();

  // Initialize balances
  people.forEach(person => balances.set(person, 0));

  // Calculate net balance for each person
  room.expenses.forEach(expense => {
    const amountPerPerson = expense.amount / expense.splitBetween.length;
    
    // Person who paid gets credited
    const currentPaid = balances.get(expense.paidBy) || 0;
    balances.set(expense.paidBy, currentPaid + expense.amount);
    
    // People who split owe their share
    expense.splitBetween.forEach(person => {
      const currentOwed = balances.get(person) || 0;
      balances.set(person, currentOwed - amountPerPerson);
    });
  });

  // Convert to Person array
  const creditors: Person[] = [];
  const debtors: Person[] = [];

  balances.forEach((balance, name) => {
    if (balance > 0.01) {
      // Creditor (positive balance)
      creditors.push({ name, balance });
    } else if (balance < -0.01) {
      // Debtor (negative balance)
      debtors.push({ name, balance: Math.abs(balance) });
    }
  });

  // Sort: largest first
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  // Greedy algorithm: match largest creditor with largest debtor
  const transactions: Debt[] = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    if (creditor.balance < 0.01) {
      creditorIndex++;
      continue;
    }

    if (debtor.balance < 0.01) {
      debtorIndex++;
      continue;
    }

    const amount = Math.min(creditor.balance, debtor.balance);
    
    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(amount * 100) / 100, // Round to 2 decimal places
    });

    creditor.balance -= amount;
    debtor.balance -= amount;

    if (creditor.balance < 0.01) {
      creditorIndex++;
    }
    if (debtor.balance < 0.01) {
      debtorIndex++;
    }
  }

  return transactions;
}
