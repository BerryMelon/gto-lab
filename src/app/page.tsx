'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { KuhnTrainer } from '@/lib/cfr/KuhnTrainer';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryPoint {
  iteration: number;
  [key: string]: number;
}

export default function GTOLab() {
  const [isRunning, setIsPlaying] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [speed, setSpeed] = useState(10); // iterations per tick
  const [chartData, setChartData] = useState<HistoryPoint[]>([]);
  const [showRules, setShowRules] = useState(false);
  
  const trainerRef = useRef<KuhnTrainer>(new KuhnTrainer());
  const animationRef = useRef<number>(null);
  const lastChartUpdateRef = useRef<number>(0);
  const totalIterationsRef = useRef<number>(0);

  // Derived data for the table
  const strategyResults = useMemo(() => {
    return trainerRef.current.getResults();
  }, [iterations]);

  const tick = () => {
    if (!isRunning) return;
    
    trainerRef.current.train(speed);
    totalIterationsRef.current += speed;
    const newIterations = totalIterationsRef.current;
    
    // Batch UI updates
    setIterations(newIterations);

    // Update chart data periodically
    if (newIterations - lastChartUpdateRef.current >= Math.max(10, speed * 2)) {
      lastChartUpdateRef.current = newIterations;
      const results = trainerRef.current.getResults();
      const point: HistoryPoint = { iteration: newIterations };
      
      const keyNodes = [
        { key: '1', label: 'P1 Bluff (J)' },
        { key: '3b', label: 'P2 Call (K vs Bet)' },
        { key: '2p', label: 'P2 Bet (Q vs Check)' },
        { key: '1pb', label: 'P1 Call (J vs Check-Bet)' }
      ];

      keyNodes.forEach(n => {
        const node = results.find(r => r.infoSet === n.key);
        if (node) {
          point[n.label] = parseFloat(node.strategy[1].toFixed(3));
        }
      });

      setChartData(prev => {
        const newData = [...prev, point];
        return newData.slice(-100);
      });
    }

    animationRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(tick);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, speed]);

  const handleReset = () => {
    setIsPlaying(false);
    trainerRef.current = new KuhnTrainer();
    totalIterationsRef.current = 0;
    lastChartUpdateRef.current = 0;
    setIterations(0);
    setChartData([]);
  };

  const getCardName = (val: string[0]) => {
    if (val === '1') return 'Jack';
    if (val === '2') return 'Queen';
    if (val === '3') return 'King';
    return val;
  };

  const getHistoryLabel = (hist: string) => {
    if (!hist) return 'P1 Open';
    if (hist === 'p') return 'P2 vs Check';
    if (hist === 'b') return 'P2 vs Bet';
    if (hist === 'pb') return 'P1 vs Check-Bet';
    return hist;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-blue-500 italic">THE GTO LAB</h1>
          <p className="text-slate-400 text-sm">Visualizing Nash Equilibrium through CFR</p>
        </div>
        <button 
          onClick={() => setShowRules(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-full text-xs font-bold transition-all border border-slate-700"
        >
          HOW IT WORKS?
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Table */}
        <div className="lg:col-span-5 space-y-8">
          {/* Controls */}
          <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Iterations</span>
                <span className="text-4xl font-mono font-black text-white">{iterations.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsPlaying(!isRunning)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                  }`}
                >
                  {isRunning ? (
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="w-6 h-6 fill-white ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
                <button 
                  onClick={handleReset}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center border border-slate-700"
                >
                  <svg className="w-5 h-5 fill-slate-400" viewBox="0 0 24 24"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>Simulation Speed</span>
                <span>{speed}x</span>
              </div>
              <input 
                type="range" min="1" max="1000" step="10"
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </section>

          {/* Strategy Table */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Current Average Strategy</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500">
                    <th className="p-3">Situation (Card + Context)</th>
                    <th className="p-3">Pass / Fold</th>
                    <th className="p-3">Bet / Call</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {strategyResults.map((res) => (
                    <tr key={res.infoSet} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-mono text-xs">
                        <span className="text-blue-400 font-bold">{getCardName(res.infoSet[0])}</span>
                        <span className="text-slate-500 ml-2">({getHistoryLabel(res.infoSet.slice(1))})</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-slate-600"
                              animate={{ width: `${res.strategy[0] * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-[10px] font-mono">{(res.strategy[0] * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-blue-500"
                              animate={{ width: `${res.strategy[1] * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-[10px] font-mono font-bold text-blue-400">{(res.strategy[1] * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-[500px] flex flex-col">
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Convergence Chart</h3>
              <p className="text-[10px] text-slate-500">Tracking key decision points stabilizing toward Equilibrium</p>
            </div>
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="iteration" hide />
                  <YAxis domain={[0, 1]} stroke="#475569" fontSize={10} tickFormatter={(v) => `${v * 100}%`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ padding: '2px 0' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="P1 Bluff (J)" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="P2 Call (K vs Bet)" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="P2 Bet (Q vs Check)" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="P1 Call (J vs Check-Bet)" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
                  {/* Nash Reference Line for P1 Bluff Jack (should be 1/3) */}
                  <ReferenceLine y={0.333} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} label={{ position: 'right', value: '1/3', fill: '#ef4444', fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Education Panel */}
          <section className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-2xl">
            <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 fill-blue-400" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              What am I looking at?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              This simulation uses <strong>CFR (Counterfactual Regret Minimization)</strong>. 
              The AI plays millions of games against itself. At first, its play is purely random. 
              When it loses, it records "regret" for the actions it <em>didn't</em> take. 
              Over time, it minimizes this regret by favoring better actions, eventually settling on a 
              <strong> Nash Equilibrium</strong>—a strategy that cannot be exploited by any opponent.
            </p>
          </section>
        </div>
      </main>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowRules(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
            >
              <button onClick={() => setShowRules(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
              
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <span className="bg-blue-600 px-3 py-1 rounded text-white italic">Kuhn Poker</span>
                Rules
              </h2>
              
              <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white mb-2 underline decoration-blue-500">The Deck</h4>
                    <p>Only 3 cards: <strong>Jack, Queen, King</strong>. Highest card wins. Each player gets 1 card.</p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-white mb-2 underline decoration-blue-500">The Betting</h4>
                    <p>1 unit ante. Players can Check (Pass) or Bet 1 additional unit.</p>
                  </div>
                </div>

                <div className="border-l-4 border-blue-600 pl-4 py-2">
                  <h4 className="font-bold text-white mb-2">Wait, there's GTO in a 3-card game?</h4>
                  <p>
                    Yes! For example, if Player 1 always checks with a Jack, Player 2 can exploit them by 
                    always betting. To be unexploitable, Player 1 must <strong>bluff</strong> with a Jack 
                    exactly 1/3 of the time. The visualizer shows the AI discovering this magic number.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowRules(false)}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
              >
                GOT IT, LET'S SIMULATE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
