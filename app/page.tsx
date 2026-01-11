'use client';

import { useRouter } from 'next/navigation';
import { Wallet, Users, Zap, ArrowRight } from 'lucide-react';
import { generateRoomId } from '@/lib/utils';
import { saveRoom } from '@/lib/storage';
import { Room } from '@/types';

export default function Home() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    const newRoom: Room = {
      id: roomId,
      expenses: [],
      createdAt: Date.now(),
    };
    saveRoom(newRoom);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Echo-Wallet
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
            Split expenses with friends. No login required. Just share a link.
          </p>
          <button
            onClick={handleCreateRoom}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105"
          >
            Create Trip
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Sign-Up</h3>
            <p className="text-white/70">
              Start tracking expenses instantly. No accounts, no downloads, just a simple link.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="p-3 bg-pink-500/20 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Settlement</h3>
            <p className="text-white/70">
              Our algorithm calculates the minimum transactions needed to settle all debts.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
              <Wallet className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Real-Time Sync</h3>
            <p className="text-white/70">
              All expenses update in real-time. Perfect for group trips and shared dinners.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Create a Room</h3>
              <p className="text-white/70 text-sm">
                Click "Create Trip" to generate a unique room with a shareable link.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Add Expenses</h3>
              <p className="text-white/70 text-sm">
                Track who paid what and split expenses between group members.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Settle Up</h3>
              <p className="text-white/70 text-sm">
                View simplified transactions to settle all debts with minimal payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
