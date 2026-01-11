'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Room, Expense } from '@/types';
import { getRoom, saveRoom, addExpense, deleteExpense, getAllPeople } from '@/lib/storage';
import { calculateDebts } from '@/lib/debt-simplifier';
import RoomHeader from '@/components/RoomHeader';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import DebtSettlement from '@/components/DebtSettlement';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [debts, setDebts] = useState<{ from: string; to: string; amount: number }[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!roomId) return;

    const loadedRoom = getRoom(roomId);
    if (!loadedRoom) {
      // Room doesn't exist, redirect to home
      router.push('/');
      return;
    }

    setRoom(loadedRoom);
    updatePeople(loadedRoom);
    updateDebts(loadedRoom);
  }, [roomId, router]);

  const updatePeople = (currentRoom: Room) => {
    const allPeople = getAllPeople(currentRoom);
    setPeople(allPeople.length > 0 ? allPeople : ['Person 1', 'Person 2']);
  };

  const updateDebts = (currentRoom: Room) => {
    const calculatedDebts = calculateDebts(currentRoom);
    setDebts(calculatedDebts);
  };

  const handleAddExpense = (expense: Expense) => {
    if (!room) return;

    const success = addExpense(roomId, expense);
    if (success) {
      const updatedRoom = getRoom(roomId);
      if (updatedRoom) {
        setRoom(updatedRoom);
        updatePeople(updatedRoom);
        updateDebts(updatedRoom);
        showToastMessage('Expense added successfully!');
      }
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!room) return;

    const success = deleteExpense(roomId, expenseId);
    if (success) {
      const updatedRoom = getRoom(roomId);
      if (updatedRoom) {
        setRoom(updatedRoom);
        updatePeople(updatedRoom);
        updateDebts(updatedRoom);
        showToastMessage('Expense deleted!');
      }
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <div className="text-white/70">Loading room...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        
        <RoomHeader roomId={roomId} roomName={room.name} />

        <ExpenseForm people={people} onSubmit={handleAddExpense} />

        {room.expenses.length > 0 && (
          <>
            <ExpenseList
              expenses={room.expenses}
              people={people}
              onDelete={handleDeleteExpense}
            />

            <DebtSettlement debts={debts} />
          </>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 backdrop-blur-md bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg px-6 py-3 shadow-2xl animate-fade-in z-50 transform transition-all duration-300">
            <p className="text-white font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              {toastMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
