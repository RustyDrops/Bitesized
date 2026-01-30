import React from 'react';
import { LearningPlan, Depth } from '../types';

interface BadgeProps {
  plan: LearningPlan;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
  extraClasses?: string; // For the circle div
}

const Badge: React.FC<BadgeProps> = ({ plan, size = 'md', className = '', showLabel = true, extraClasses = '' }) => {
  const badgeTitle = plan.depth === Depth.OVERVIEW
    ? `Introductory to ${plan.topic}`
    : `${plan.topic} Practitioner`;

  const badgeIcon = plan.depth === Depth.OVERVIEW ? "🥉" : "🥈";
  const badgeColor = plan.depth === Depth.OVERVIEW ? "from-amber-100 to-amber-50" : "from-slate-200 to-slate-50";

  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl border-2',
    md: 'w-24 h-24 text-5xl border-2',
    lg: 'w-40 h-40 text-7xl border-4'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br ${badgeColor} rounded-full flex items-center justify-center shadow-lg relative border-white ${extraClasses}`}
        title={badgeTitle}
      >
        {badgeIcon}
      </div>
      {showLabel && (
        <div className="text-center mt-2">
           <span className="text-xs font-bold text-slate-700 block">{plan.topic}</span>
           <span className="text-[10px] text-slate-500 uppercase tracking-wide block">{plan.depth}</span>
        </div>
      )}
    </div>
  );
};

export default Badge;
