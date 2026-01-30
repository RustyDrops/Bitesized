import React from 'react';
import { User, LearningPlan } from '../types';
import Badge from './Badge';

interface ProfileProps {
  user: User | null;
  plans: LearningPlan[];
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, plans, onBack }) => {
  const completedPlans = plans.filter(p => p.quizPassed);

  return (
    <div className="flex-1 bg-white p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
          👤
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Guest User'}</h2>
          <p className="text-slate-500">{user?.email}</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-4">Your Achievements</h3>

      {completedPlans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="text-4xl mb-4">🎓</div>
          <h4 className="text-lg font-bold text-slate-700 mb-2">No badges yet</h4>
          <p className="text-slate-500 mb-6">Complete a course quiz to earn your first badge!</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-100"
          >
            Start Learning
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {completedPlans.map(plan => (
            <div key={plan.id} className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
               <Badge plan={plan} size="md" />
            </div>
          ))}
        </div>
      )}

      {completedPlans.length > 0 && (
         <div className="mt-auto pt-8">
           <button
             onClick={onBack}
             className="w-full text-slate-500 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
           >
             Back to Dashboard
           </button>
         </div>
      )}
    </div>
  );
};

export default Profile;
