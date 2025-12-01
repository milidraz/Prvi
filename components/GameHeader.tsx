import React from 'react';
import { Trophy, Flame } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  streak: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ score, streak }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 flex justify-between items-center glass-panel p-4 rounded-xl">
      <div className="flex items-center gap-2 text-yellow-400">
        <Trophy className="w-6 h-6" />
        <span className="font-bold text-xl">{score} <span className="text-sm font-normal text-slate-400">Punkte</span></span>
      </div>
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-wider">
          NEURO-RÄTSEL
        </h1>
      </div>
      <div className="flex items-center gap-2 text-orange-400">
        <Flame className={`w-6 h-6 ${streak > 2 ? 'animate-pulse' : ''}`} />
        <span className="font-bold text-xl">{streak} <span className="text-sm font-normal text-slate-400">Streak</span></span>
      </div>
    </div>
  );
};