'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';

interface RoomHeaderProps {
  roomId: string;
  roomName?: string;
}

export default function RoomHeader({ roomId, roomName }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const roomUrl = typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : '';

  const handleCopy = async () => {
    if (roomUrl) {
      await copyToClipboard(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {roomName || 'Expense Room'}
          </h1>
          <p className="text-white/70 text-sm">Share this link with your friends</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
      <div className="mt-4 p-3 bg-black/20 rounded-lg border border-white/10">
        <p className="text-white/60 text-xs font-mono break-all">{roomUrl}</p>
      </div>
    </div>
  );
}
