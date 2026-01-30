
import React from 'react';
import { LearningPlan, Depth } from '../types';

interface BadgeScreenProps {
  plan: LearningPlan;
  onBack: () => void;
  onShare: () => void;
}

const BadgeScreen: React.FC<BadgeScreenProps> = ({ plan, onBack, onShare }) => {
  const badgeTitle = plan.depth === Depth.OVERVIEW 
    ? `Introductory to ${plan.topic}` 
    : `${plan.topic} Practitioner`;

  const badgeIcon = plan.depth === Depth.OVERVIEW ? "🥉" : "🥈";
  const badgeColor = plan.depth === Depth.OVERVIEW ? "from-amber-100 to-amber-50" : "from-slate-200 to-slate-50";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
      <div className="mb-10 relative">
        <div className="absolute inset-0 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className={`w-40 h-40 bg-gradient-to-br ${badgeColor} rounded-full flex items-center justify-center text-7xl shadow-2xl relative border-4 border-white`}>
          {badgeIcon}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          Mastered
        </div>
      </div>

      <h2 className="text-3xl font-lexend font-bold text-slate-900 mb-2">Achievement Unlocked!</h2>
      <p className="text-slate-500 mb-8 max-w-xs">You've successfully completed the assessment for <span className="font-bold text-slate-800">{plan.topic}</span>.</p>
      
      <div className="bg-slate-50 w-full p-6 rounded-3xl border border-slate-100 mb-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Badge Awarded</span>
        <h3 className="text-xl font-lexend font-bold text-blue-700">{badgeTitle}</h3>
        <p className="text-xs text-slate-400 mt-2 italic">Granted upon completion of assessment on {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-3 w-full">
        <button 
          onClick={onShare}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684m0 2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share Achievement
        </button>
        <button 
          onClick={onBack}
          className="w-full text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BadgeScreen;
