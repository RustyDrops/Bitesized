
import React, { useMemo } from 'react';
import { LearningPlan, Depth } from '../types';

interface DashboardProps {
  plan: LearningPlan;
  onOpenBite: (biteId: string) => void;
  onBack: () => void;
  onStartQuiz: () => void;
  onViewBadge: () => void;
}

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const Dashboard: React.FC<DashboardProps> = ({ plan, onOpenBite, onBack, onStartQuiz, onViewBadge }) => {
  const completedBites = useMemo(() => plan.bites.filter(b => b.completed), [plan.bites]);
  const completedCount = completedBites.length;
  const progressPercent = Math.round((completedCount / plan.totalBites) * 100);
  const isComplete = progressPercent === 100;

  // Analytics
  const totalTimeSpent = plan.bites.reduce((acc, bite) => acc + (bite.timeSpentSeconds || 0), 0);
  const avgTimePerBite = completedBites.length > 0 
    ? Math.round(totalTimeSpent / completedBites.length) 
    : 0;

  // Find completion trend (e.g., fastest bite)
  const fastestBite = useMemo(() => completedBites.length > 0
    ? [...completedBites].sort((a, b) => (a.timeSpentSeconds || Infinity) - (b.timeSpentSeconds || Infinity))[0]
    : null, [completedBites]);

  const handleShare = () => {
    const summary = `Current learning: ${plan.topic} (${plan.depth})\nProgress: ${progressPercent}%\nTotal learning time: ${formatTime(totalTimeSpent)}\nCreated via Bite Sized Learning 🧠`;
    navigator.clipboard.writeText(summary);
    alert("Plan summary copied to clipboard!");
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={handleShare}
          className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-lexend font-bold text-slate-900 leading-tight mb-4">{plan.topic}</h2>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-slate-800">Learning Progress</span>
            <span className="text-blue-600 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time Learned</span>
            <div className="text-lg font-bold text-blue-600">{formatTime(totalTimeSpent)}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Avg per Bite</span>
            <div className="text-lg font-bold text-blue-600">{formatTime(avgTimePerBite)}</div>
          </div>
        </div>

        {fastestBite && (
           <div className="bg-green-50 p-4 rounded-2xl border border-green-100 shadow-sm mb-6 flex items-center gap-3">
             <div className="text-2xl">⚡</div>
             <div>
               <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block">Fastest Completion</span>
               <div className="text-sm font-bold text-green-800">"{fastestBite.title}" in {formatTime(fastestBite.timeSpentSeconds || 0)}</div>
             </div>
           </div>
        )}

        {isComplete && (
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-100 animate-bounce-slow">
            <h3 className="font-lexend font-bold text-lg mb-2">Final Step Unlocked! 🔓</h3>
            <p className="text-sm opacity-90 mb-4">You've finished all bites! Pass the assessment quiz to earn your badge.</p>
            {plan.quizPassed ? (
              <button 
                onClick={onViewBadge}
                className="w-full bg-yellow-400 text-yellow-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                🏆 View Your Badge
              </button>
            ) : (
              <button 
                onClick={onStartQuiz}
                className="w-full bg-white text-blue-600 font-bold py-3 rounded-xl shadow-md"
              >
                Take Mastery Quiz
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 pb-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bite Path</h3>
        {plan.bites.map((bite, index) => (
          <button
            key={bite.id}
            onClick={() => onOpenBite(bite.id)}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left relative"
          >
            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm ${bite.completed ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
              {index + 1}
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 line-clamp-1">{bite.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                {formatTime(bite.timeSpentSeconds || 0)} spent • {bite.estimatedMinutes}m est.
              </p>
            </div>

            {bite.completed && (
              <div className="bg-green-100 text-green-600 rounded-full w-5 h-5 flex items-center justify-center">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
