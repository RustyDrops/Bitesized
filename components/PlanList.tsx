
import React, { useState, useRef, useEffect } from 'react';
import { LearningPlan, Depth } from '../types';

interface PlanListProps {
  plans: LearningPlan[];
  onSelectPlan: (id: string) => void;
  onNewPlan: () => void;
}

const formatTimeShort = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  return `${mins}m`;
};

const PlanList: React.FC<PlanListProps> = ({ plans, onSelectPlan, onNewPlan }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setShowStickyTitle(containerRef.current.scrollTop > 40);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-slate-50 overflow-y-auto scrollbar-hide pb-24">
      {/* Sticky Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md z-20 border-b border-slate-200/50 shadow-sm transition-all h-[72px]">
        <div className={`font-lexend font-bold text-slate-800 text-sm transition-opacity duration-300 ${showStickyTitle ? 'opacity-100' : 'opacity-0'}`}>
          Your Library
        </div>
        <button 
          onClick={onNewPlan}
          className={`flex items-center justify-center transition-all duration-300 ${showStickyTitle ? 'bg-blue-600 text-white w-8 h-8 rounded-lg shadow-md' : 'bg-blue-600 text-white w-10 h-10 rounded-full shadow-lg shadow-blue-200 hover:scale-105 active:scale-95'}`}
        >
           <span className={`${showStickyTitle ? 'text-lg' : 'text-2xl'} font-bold`}>+</span>
        </button>
      </div>

      <div className="p-6 pt-2 space-y-6 animate-fade-in min-h-full">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-lexend font-bold text-slate-900 leading-tight">Your Library</h2>
            <p className="text-slate-500 text-sm mt-1">{plans.length} active learning paths</p>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm border border-slate-100">📚</div>
            <h3 className="font-lexend font-bold text-slate-800 mb-2 text-lg">Your library is empty</h3>
            <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">Start by creating your first bite-sized learning path to begin your journey.</p>
            <button
              onClick={onNewPlan}
              className="text-white font-bold px-8 py-4 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:translate-y-[-2px] active:translate-y-0 transition-all"
            >
              Create First Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => {
              const completedCount = plan.bites.filter(b => b.completed).length;
              const progress = Math.round((completedCount / plan.totalBites) * 100);
              const totalTime = plan.bites.reduce((acc, b) => acc + (b.timeSpentSeconds || 0), 0);

              return (
                <button
                  key={plan.id}
                  onClick={() => onSelectPlan(plan.id)}
                  className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-lexend font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{plan.topic}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {plan.depth}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {plan.totalBites} Bites
                        </span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                          {formatTimeShort(totalTime)} learned
                        </span>
                      </div>
                    </div>
                    {plan.quizPassed && (
                      <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-full text-xs shadow-sm" title="Badge Earned">🏆</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PlanList;
