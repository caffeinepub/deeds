import React, { useState } from 'react';
import { type LoveNote } from '../hooks/useQueries';

interface LoveNoteCardProps {
  note: LoveNote;
}

export default function LoveNoteCard({ note }: LoveNoteCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="cursor-pointer select-none"
      onClick={() => setIsOpen(!isOpen)}
    >
      {!isOpen ? (
        /* Sealed envelope */
        <div className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="bg-gradient-to-br from-rose-50 to-pink-100 border border-rose-200 rounded-2xl p-6 flex flex-col items-center gap-3">
            <img
              src="/assets/generated/love-note-envelope.dim_256x256.png"
              alt="Love Note"
              className="h-20 w-20 object-contain group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              className="hidden h-20 w-20 items-center justify-center text-4xl"
              style={{ display: 'none' }}
            >
              💌
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">A Love Note</p>
              <p className="text-xs text-rose-400 mt-1">{formatTimestamp(note.timestamp)}</p>
            </div>
            <p className="text-xs text-rose-400 italic">Tap to open ✨</p>
          </div>
          {/* Envelope flap decoration */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-rose-200/50 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* Opened note */
        <div className="rounded-2xl overflow-hidden shadow-lg border border-rose-200 bg-gradient-to-br from-white to-rose-50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💌</span>
              <div>
                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">From</p>
                <p className="text-sm font-bold text-rose-700">A Kind Stranger</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{formatTimestamp(note.timestamp)}</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 border border-rose-100">
            <p className="text-base leading-relaxed text-gray-700 italic">"{note.message}"</p>
          </div>
          <p className="text-xs text-center text-rose-400">Tap to close 💕</p>
        </div>
      )}
    </div>
  );
}
