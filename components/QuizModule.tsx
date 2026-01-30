
import React, { useState } from 'react';
import { LearningPlan } from '../types';

interface QuizModuleProps {
  plan: LearningPlan;
  onBack: () => void;
  onComplete: (score: number) => void;
}

const QuizModule: React.FC<QuizModuleProps> = ({ plan, onBack, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = plan.quiz[currentQuestionIndex];

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    
    if (currentQuestionIndex < plan.quiz.length - 1) {
      setAnswers(newAnswers);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      const correctCount = newAnswers.reduce((acc, val, idx) => {
        return val === plan.quiz[idx].correctIndex ? acc + 1 : acc;
      }, 0);
      onComplete(correctCount);
    }
  };

  const progress = Math.round(((currentQuestionIndex + 1) / plan.quiz.length) * 100);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide pb-28">
      {/* Sticky Header */}
      <div className="px-6 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20 border-b border-slate-100 shadow-sm transition-all h-[72px]">
        <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 text-center px-4">
          <h2 className="font-lexend font-bold text-slate-900 leading-tight text-sm uppercase tracking-widest">Mastery Quiz</h2>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="p-6 space-y-8 animate-fade-in">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Progress</span>
            <span>{currentQuestionIndex + 1} / {plan.quiz.length}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
             <div className="bg-blue-600 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-lexend font-bold text-slate-800 leading-tight">{currentQuestion.question}</h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all shadow-sm ${selectedOption === idx ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.01]' : 'border-slate-100 bg-white hover:border-blue-200'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex-shrink-0 flex items-center justify-center font-bold text-sm transition-colors ${selectedOption === idx ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`font-medium text-lg leading-snug ${selectedOption === idx ? 'text-blue-900' : 'text-slate-600'}`}>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t p-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <button
          disabled={selectedOption === null}
          onClick={handleNext}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${selectedOption === null ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white shadow-blue-200 active:scale-[0.98] hover:translate-y-[-1px]'}`}
        >
          {currentQuestionIndex === plan.quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
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

export default QuizModule;
