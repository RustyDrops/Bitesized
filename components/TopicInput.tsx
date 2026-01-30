
import React, { useState } from 'react';
import { Depth, LearningMode } from '../types';

interface TopicInputProps {
  onSubmit: (topic: string, depth: Depth, mode: LearningMode, dailyTime: number) => void;
  hasPlans: boolean;
  onViewPlans: () => void;
}

const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, hasPlans, onViewPlans }) => {
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<Depth>(Depth.OVERVIEW);
  const [mode, setMode] = useState<LearningMode>(LearningMode.KNOWLEDGE);
  const [dailyTime, setDailyTime] = useState(15);

  const featuredTopics = [
    { title: "UX/UI Design Principles", icon: "🎨", depth: Depth.OVERVIEW, duration: 15 },
    { title: "Python for Beginners", icon: "🐍", depth: Depth.DETAILED, duration: 25 },
    { title: "Digital Marketing Strategy", icon: "📈", depth: Depth.OVERVIEW, duration: 20 },
    { title: "Public Speaking Mastery", icon: "🎤", depth: Depth.OVERVIEW, duration: 15 },
    { title: "Emotional Intelligence", icon: "🧠", depth: Depth.DETAILED, duration: 20 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSubmit(topic, depth, mode, dailyTime);
  };

  const startFeatured = (t: typeof featuredTopics[0]) => {
    onSubmit(t.title, t.depth, LearningMode.KNOWLEDGE, t.duration);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-white scrollbar-hide">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-lexend font-bold text-slate-900 leading-tight">Ready to grow?</h2>
          <p className="text-slate-500 text-sm mt-1">Design your own path or pick a featured one.</p>
        </div>
        {hasPlans && (
          <button 
            onClick={onViewPlans}
            className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
        )}
      </div>

      {/* Featured Tracks */}
      <section className="mb-10">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Start Tracks</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
          {featuredTopics.map((t) => (
            <button
              key={t.title}
              onClick={() => startFeatured(t)}
              className="flex-shrink-0 w-40 bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 group"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">{t.icon}</div>
              <div className="font-bold text-slate-800 text-sm leading-snug h-10 line-clamp-2">{t.title}</div>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-blue-600 uppercase bg-white border border-blue-100 px-1.5 py-0.5 rounded">
                  {t.depth}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="relative py-4 mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
        <div className="relative flex justify-center text-xs uppercase font-bold tracking-tighter text-slate-300 bg-white px-4">Or create custom</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Topic</label>
          <input 
            type="text" 
            placeholder="e.g. Behavioral Economics"
            className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none transition-colors shadow-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Knowledge Depth</label>
            <div className="flex gap-3">
              {[Depth.OVERVIEW, Depth.DETAILED].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  className={`flex-1 py-4 rounded-xl border-2 font-bold transition-all capitalize shadow-sm ${depth === d ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 text-slate-400 bg-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Budget</label>
              <span className="text-xs font-bold text-blue-600">{dailyTime} mins</span>
            </div>
            <input 
              type="range" min="5" max="60" step="5" 
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              value={dailyTime}
              onChange={(e) => setDailyTime(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Learning Style</label>
            <div className="grid grid-cols-1 gap-3">
              {[LearningMode.KNOWLEDGE, LearningMode.HANDS_ON].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`text-left p-4 rounded-xl border-2 transition-all shadow-sm ${mode === m ? 'border-blue-600 bg-blue-50' : 'border-slate-50 bg-white'}`}
                >
                  <div className={`font-bold ${mode === m ? 'text-blue-700' : 'text-slate-800'}`}>
                    {m === LearningMode.KNOWLEDGE ? 'Mental Models & Theory' : 'Practical Projects'}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 opacity-80">
                    {m === LearningMode.KNOWLEDGE ? 'Focus on conceptual understanding.' : 'Includes bite-sized implementation tasks.'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={!topic.trim()}
          className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 hover:translate-y-[-2px] active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 transition-all text-lg"
        >
          Generate Path
        </button>
      </form>
    </div>
  );
};

export default TopicInput;
