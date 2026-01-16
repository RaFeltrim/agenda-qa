
import React from 'react';
import { X, TrendingDown, Info, Award, Activity, Zap } from 'lucide-react';
import { Sprint, Card } from '../../types';

interface PerformanceModalProps {
  sprint: Sprint;
  cards: Card[];
  onClose: () => void;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({ sprint, cards, onClose }) => {
  const sprintCards = cards.filter(c => c.sprintId === sprint.id);
  
  const calculateTotalPoints = () => {
    return sprintCards.reduce((acc, c) => acc + 10 + (c.subTasks.length * 2), 0);
  };

  const calculateRemainingPoints = () => {
    return sprintCards.reduce((acc, c) => {
      if (c.status === 'concluido') return acc;
      const pendingSubtasks = c.subTasks.filter(st => !st.concluida).length;
      return acc + 10 + (pendingSubtasks * 2);
    }, 0);
  };

  const total = calculateTotalPoints();
  const remaining = calculateRemainingPoints();
  const completed = total - remaining;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const days = 14; 
  const idealPath = Array.from({ length: days + 1 }, (_, i) => [
    (i / days) * 100,
    100 - (i / days) * 100 
  ]);

  const actualPath = [
    [0, 100],
    [30, 85],
    [50, 100 - percentage]
  ];

  // Helper for SVG path d attribute
  const pointsToPath = (pts: number[][]) => pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.join(',')).join(' ');
  // Create area path for gradient
  const areaPath = `${pointsToPath(actualPath)} L ${actualPath[actualPath.length-1][0]},100 L 0,100 Z`;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/10">
        <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Activity className="w-6 h-6" />
              </span>
              Performance: {sprint.nome}
            </h2>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2 ml-1">Analytics em Tempo Real</p>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 overflow-y-auto max-h-[75vh] space-y-10">
          {/* Top Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Zap className="w-20 h-20" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Score</p>
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-black tracking-tighter ${percentage > 70 ? 'text-emerald-500' : percentage > 40 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {percentage}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-4 overflow-hidden">
                 <div className={`h-full ${percentage > 70 ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-1000`} style={{width: `${percentage}%`}}></div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pontos Totais</p>
              <p className="text-5xl font-black dark:text-white tracking-tighter">{total}</p>
              <p className="text-xs font-bold text-indigo-500 mt-2">+12% vs média</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] shadow-xl shadow-indigo-500/20 text-white">
              <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3">Tasks Restantes</p>
              <p className="text-5xl font-black tracking-tighter">{sprintCards.length - sprintCards.filter(c => c.status === 'concluido').length}</p>
              <p className="text-xs font-bold text-indigo-200 mt-2">Foco total necessário</p>
            </div>
          </div>

          {/* Burndown Chart */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm uppercase tracking-wide">
                <TrendingDown className="w-5 h-5 text-indigo-600" />
                Burndown Chart
              </h3>
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span> Ideal
                </span>
                <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Real
                </span>
              </div>
            </div>

            <div className="h-72 w-full bg-slate-50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" className="text-indigo-500" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-indigo-500" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[25, 50, 75].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.1" className="text-slate-200 dark:text-slate-600" strokeDasharray="2" />
                ))}
                
                {/* Area Fill */}
                <path d={areaPath} fill="url(#chartGradient)" className="text-indigo-500" />

                {/* Ideal Path */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="1 1"
                  className="text-slate-300 dark:text-slate-500"
                  points={idealPath.map(p => p.join(',')).join(' ')}
                />

                {/* Actual Path */}
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-indigo-600 dark:text-indigo-400 drop-shadow-md"
                  points={actualPath.map(p => p.join(',')).join(' ')}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Current Point Dot */}
                <circle 
                  cx={actualPath[actualPath.length-1][0]} 
                  cy={actualPath[actualPath.length-1][1]} 
                  r="1.5" 
                  className="fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900 stroke-[0.5]"
                />
              </svg>

              {/* Axis Labels */}
              <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-between text-[8px] font-bold text-slate-400 py-8">
                <span>{total}</span>
                <span>0</span>
              </div>
            </div>
          </div>

          {/* Insights Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50 flex gap-6 items-start">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600 shadow-md flex-shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-indigo-900 dark:text-indigo-300 text-sm mb-2 uppercase tracking-wide">Orquestrador Intelligence</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {percentage > 60 
                  ? "O ritmo de entrega está acima da média histórica. A probabilidade de conclusão do sprint sem carryover é de 85%. Mantenha o foco em code reviews para evitar gargalos no final."
                  : "Detectamos um risco de atraso. A velocidade atual indica que 30% do escopo pode não ser entregue. Recomenda-se reavaliar os itens bloqueados prioritariamente."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceModal;
