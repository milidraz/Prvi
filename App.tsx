
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Lightbulb, ArrowRight, RefreshCw, AlertCircle, Trophy, Users, Save, Home } from 'lucide-react';
import { GameStatus, RiddleCategory, RiddleData, HighScore } from './types';
import { generateRiddle } from './services/geminiService';
import { Button } from './components/Button';
import { GameHeader } from './components/GameHeader';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [category, setCategory] = useState<RiddleCategory>(RiddleCategory.ABSTRACT);
  const [currentRiddle, setCurrentRiddle] = useState<RiddleData | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Highscore States
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [playerName, setPlayerName] = useState('');
  
  // No longer strictly needed for focus, but kept if we re-introduce inputs later
  const inputRef = useRef<HTMLInputElement>(null);

  // Load scores on mount
  useEffect(() => {
    const saved = localStorage.getItem('neuro-raetsel-scores');
    if (saved) {
      try {
        setHighScores(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse high scores", e);
      }
    }
  }, []);

  const handleStartGame = async (selectedCat: RiddleCategory) => {
    setCategory(selectedCat);
    await fetchNewRiddle(selectedCat);
  };

  const fetchNewRiddle = async (cat: RiddleCategory) => {
    setStatus(GameStatus.LOADING);
    setShowHint(false);
    setUserInput('');
    setErrorMsg('');
    
    try {
      const riddle = await generateRiddle(cat);
      setCurrentRiddle(riddle);
      setStatus(GameStatus.PLAYING);
    } catch (e) {
      setErrorMsg("Verbindung zur KI fehlgeschlagen. Bitte prüfe deinen API-Key.");
      setStatus(GameStatus.ERROR);
    }
  };

  const handleGuess = (selectedAnswer: string) => {
    if (!currentRiddle) return;

    setUserInput(selectedAnswer);
    
    const normalizedGuess = selectedAnswer.toLowerCase().trim();
    const normalizedAnswer = currentRiddle.answer.toLowerCase().trim();

    if (normalizedGuess === normalizedAnswer) {
      setScore(s => s + (showHint ? 50 : 100));
      setStreak(s => s + 1);
      setStatus(GameStatus.SUCCESS);
    } else {
      setStreak(0);
      setStatus(GameStatus.FAILURE);
    }
  };

  const nextRound = () => {
    fetchNewRiddle(category);
  };

  const backToMenu = () => {
    setStatus(GameStatus.MENU);
    setScore(0);
    setStreak(0);
    setPlayerName('');
  };

  const saveScore = () => {
    if (!playerName.trim()) return;
    
    const newScore: HighScore = {
      name: playerName.trim(),
      score: score,
      date: new Date().toLocaleDateString('de-DE')
    };
    
    const newScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Keep top 10
      
    setHighScores(newScores);
    localStorage.setItem('neuro-raetsel-scores', JSON.stringify(newScores));
    setStatus(GameStatus.LEADERBOARD);
  };

  // -- RENDERERS --

  const renderMenu = () => (
    <div className="flex flex-col items-center animate-fade-in w-full max-w-md">
      <div className="mb-8 p-6 rounded-full bg-slate-800/50 border border-slate-700 shadow-2xl">
        <Brain className="w-16 h-16 text-purple-400" />
      </div>
      <h2 className="text-3xl font-bold mb-2 text-white text-center">Wähle deine Herausforderung</h2>
      <p className="text-slate-400 mb-8 text-center max-w-xs">
        Löse KI-generierte Rätsel und trainiere dein logisches Denken.
      </p>

      <div className="grid grid-cols-1 gap-4 w-full">
        {Object.values(RiddleCategory).map((cat) => (
          <button
            key={cat}
            onClick={() => handleStartGame(cat)}
            className="group relative flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-white/5 hover:border-purple-500/30"
          >
            <span className="font-semibold text-lg text-slate-200 group-hover:text-white">{cat}</span>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
          </button>
        ))}
        
        <button
          onClick={() => setStatus(GameStatus.LEADERBOARD)}
          className="group relative flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-slate-700/50 transition-all duration-200 border border-white/5 hover:border-yellow-500/30 mt-4"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-lg text-slate-200 group-hover:text-white">Rangliste</span>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="w-full max-w-md animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <h2 className="text-3xl font-bold text-white">Bestenliste</h2>
      </div>
      
      <div className="glass-panel rounded-xl overflow-hidden mb-8">
        {highScores.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Noch keine Einträge. Sei der Erste!
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Spieler</th>
                <th className="p-4 text-right">Punkte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {highScores.map((entry, index) => (
                <tr key={index} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-slate-500 font-mono">{index + 1}</td>
                  <td className="p-4 font-medium text-white">
                    {entry.name}
                    <div className="text-xs text-slate-500">{entry.date}</div>
                  </td>
                  <td className="p-4 text-right font-bold text-yellow-400">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="flex justify-center">
        <Button onClick={backToMenu} variant="secondary">
          <Home className="w-5 h-5 mr-2" />
          Zum Hauptmenü
        </Button>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-64 animate-fade-in">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
        <Brain className="absolute inset-0 m-auto text-purple-500 w-8 h-8 animate-pulse" />
      </div>
      <h3 className="text-xl font-medium text-slate-300">Gemini denkt nach...</h3>
      <p className="text-sm text-slate-500 mt-2">Ein neues Rätsel wird generiert</p>
    </div>
  );

  const renderGame = () => {
    if (!currentRiddle) return null;

    return (
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {currentRiddle.difficulty}
            </span>
            <button 
              onClick={() => setShowHint(true)}
              disabled={showHint}
              className={`flex items-center gap-2 text-sm ${showHint ? 'text-slate-500' : 'text-yellow-400 hover:text-yellow-300'} transition-colors`}
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? 'Hinweis aktiv' : 'Hinweis (-50 Pkt)'}
            </button>
          </div>

          <p className="text-2xl leading-relaxed font-light text-slate-100 whitespace-pre-line mb-10 min-h-[160px]">
            {currentRiddle.riddleText}
          </p>
          
          {showHint && (
             <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fade-in">
               <p className="text-yellow-200 text-sm flex items-center gap-2">
                 <Lightbulb className="w-4 h-4" />
                 Tipp: {currentRiddle.hint}
               </p>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentRiddle.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleGuess(option)}
                className="py-4 px-6 bg-slate-800/80 hover:bg-purple-600/20 hover:border-purple-500 border border-slate-600 rounded-xl text-lg font-semibold text-slate-200 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <button onClick={backToMenu} className="text-slate-500 hover:text-slate-300 text-sm">
            Spiel beenden
          </button>
        </div>
      </div>
    );
  };

  const renderResult = (isSuccess: boolean) => (
    <div className="w-full max-w-md animate-fade-in text-center">
      <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isSuccess ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {isSuccess ? <Trophy className="w-12 h-12" /> : <AlertCircle className="w-12 h-12" />}
      </div>
      
      <h2 className="text-3xl font-bold mb-2 text-white">
        {isSuccess ? 'Fantastisch!' : 'Leider falsch!'}
      </h2>
      
      <div className="glass-panel p-6 rounded-xl mb-6 border-t-4 border-t-transparent" style={{ borderColor: isSuccess ? '#22c55e' : '#ef4444' }}>
        <p className="text-slate-400 text-sm uppercase tracking-wide mb-1">Die Lösung war</p>
        <p className="text-3xl font-bold text-white mb-2">{currentRiddle?.answer}</p>
        {!isSuccess && userInput && (
          <p className="text-slate-400 text-sm">Deine Antwort: <span className="text-red-300 line-through">{userInput}</span></p>
        )}
      </div>

      {/* Save Score Section - Show if there are points to save */}
      {score > 0 && (
        <div className="mb-6 p-4 glass-panel rounded-xl">
          <label className="block text-sm font-medium text-slate-300 mb-2">Spielstand speichern?</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Dein Name"
              maxLength={12}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 placeholder-slate-600"
            />
            <Button 
              onClick={saveScore} 
              disabled={!playerName.trim()}
              variant="secondary"
              className="!py-2 !px-4"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button onClick={nextRound} variant="primary">
          <RefreshCw className="w-5 h-5 mr-2" />
          {isSuccess ? 'Nächstes Rätsel' : 'Nochmal versuchen'}
        </Button>
        <Button onClick={backToMenu} variant="ghost">
          Hauptmenü
        </Button>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="text-center animate-fade-in p-8 glass-panel rounded-xl border-red-500/30 border">
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Fehler aufgetreten</h3>
      <p className="text-slate-300 mb-6">{errorMsg || "Unbekannter Fehler."}</p>
      <Button onClick={backToMenu} variant="secondary">Zurück zum Menü</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-slate-100 p-4 md:p-8 flex flex-col items-center">
      
      {status !== GameStatus.MENU && status !== GameStatus.LEADERBOARD && status !== GameStatus.ERROR && (
        <GameHeader score={score} streak={streak} />
      )}

      <main className="w-full flex-1 flex flex-col items-center justify-center relative z-10">
        {status === GameStatus.MENU && renderMenu()}
        {status === GameStatus.LEADERBOARD && renderLeaderboard()}
        {status === GameStatus.LOADING && renderLoading()}
        {status === GameStatus.PLAYING && renderGame()}
        {(status === GameStatus.SUCCESS || status === GameStatus.FAILURE) && renderResult(status === GameStatus.SUCCESS)}
        {status === GameStatus.ERROR && renderError()}
      </main>

      {/* Footer */}
      <footer className="mt-8 text-slate-600 text-xs text-center">
        Powered by Google Gemini 2.5 Flash • Built with React & Tailwind
      </footer>
    </div>
  );
};

export default App;
