
import React from 'react';
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
  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-lexend font-bold text-slate-900 leading-tight">Your Library</h2>
          <p className="text-slate-500 text-sm">{plans.length} active learning paths</p>
        </div>
        <button 
          onClick={onNewPlan}
          className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-transform"
        >
          <span className="text-2xl font-bold">+</span>
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-3xl">📚</div>
          <h3 className="font-lexend font-bold text-slate-800 mb-1">Your library is empty</h3>
          <p className="text-slate-500 text-sm max-w-xs">Start by creating your first bite-sized learning path.</p>
          <button 
            onClick={onNewPlan}
            className="mt-6 text-blue-600 font-bold px-6 py-3 bg-blue-50 rounded-xl"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {plans.map(plan => {
            const completedCount = plan.bites.filter(b => b.completed).length;
            const progress = Math.round((completedCount / plan.totalBites) * 100);
            const totalTime = plan.bites.reduce((acc, b) => acc + (b.timeSpentSeconds || 0), 0);
            
            return (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className="w-full text-left bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-lexend font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{plan.topic}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {plan.depth} • {plan.totalBites} Bites
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
                        {formatTimeShort(totalTime)} learned
                      </span>
                    </div>
                  </div>
                  {plan.quizPassed && (
                    <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-full text-xs" title="Badge Earned">🏆</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500"
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
  );
};

export default PlanList;
