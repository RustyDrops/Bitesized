import React, { useRef, useState, useEffect } from 'react';
import { User, LearningPlan } from '../types';
import Badge from './Badge';

interface ProfileProps {
  user: User | null;
  plans: LearningPlan[];
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, plans, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showStickyTitle, setShowStickyTitle] = useState(false);
  const completedPlans = plans.filter(p => p.quizPassed);

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
    <div ref={containerRef} className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide pb-24">
      {/* Sticky Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-100 shadow-sm transition-all h-[72px]">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={`font-lexend font-bold text-slate-800 text-sm transition-opacity duration-300 ${showStickyTitle ? 'opacity-100' : 'opacity-0'}`}>
          Your Profile
        </div>
        <div className="w-10"></div> {/* Spacer for balance */}
      </div>

      <div className="p-6 pt-2 flex-1 flex flex-col animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-lexend font-bold text-slate-900">{user?.name || 'Guest User'}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Your Achievements</h3>

        {completedPlans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="text-4xl mb-4 grayscale opacity-50">🎓</div>
            <h4 className="text-lg font-bold text-slate-700 mb-2">No badges yet</h4>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">Complete a course quiz to earn your first badge!</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-100 hover:translate-y-[-2px] transition-all"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-8">
            {completedPlans.map(plan => (
              <div key={plan.id} className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center justify-center border border-slate-100 shadow-sm hover:shadow-md transition-shadow aspect-square">
                 <Badge plan={plan} size="md" />
                 <span className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center line-clamp-1 w-full px-2">{plan.topic}</span>
              </div>
            ))}
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

export default Profile;
