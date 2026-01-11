import { Room, Expense } from '@/types';

const STORAGE_PREFIX = 'echo-wallet-room-';

export function getRoom(id: string): Room | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (!data) return null;
    return JSON.parse(data) as Room;
  } catch (error) {
    console.error('Error reading room from storage:', error);
    return null;
  }
}

export function saveRoom(room: Room): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${room.id}`, JSON.stringify(room));
  } catch (error) {
    console.error('Error saving room to storage:', error);
  }
}

export function addExpense(roomId: string, expense: Expense): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const room = getRoom(roomId);
    if (!room) return false;
    
    room.expenses.push(expense);
    saveRoom(room);
    return true;
  } catch (error) {
    console.error('Error adding expense:', error);
    return false;
  }
}

export function updateExpense(roomId: string, expenseId: string, updatedExpense: Expense): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const room = getRoom(roomId);
    if (!room) return false;
    
    const index = room.expenses.findIndex(e => e.id === expenseId);
    if (index === -1) return false;
    
    room.expenses[index] = updatedExpense;
    saveRoom(room);
    return true;
  } catch (error) {
    console.error('Error updating expense:', error);
    return false;
  }
}

export function deleteExpense(roomId: string, expenseId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const room = getRoom(roomId);
    if (!room) return false;
    
    room.expenses = room.expenses.filter(e => e.id !== expenseId);
    saveRoom(room);
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
}

// Helper to get all unique people from expenses
export function getAllPeople(room: Room): string[] {
  const peopleSet = new Set<string>();
  room.expenses.forEach(expense => {
    peopleSet.add(expense.paidBy);
    expense.splitBetween.forEach(person => peopleSet.add(person));
  });
  return Array.from(peopleSet).sort();
}
