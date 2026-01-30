
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
    
    // Calculate new answers immediately to avoid relying on stale state for the final score
    const newAnswers = [...answers, selectedOption];
    
    if (currentQuestionIndex < plan.quiz.length - 1) {
      setAnswers(newAnswers);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      // LAST QUESTION
      const correctCount = newAnswers.reduce((acc, val, idx) => {
        return val === plan.quiz[idx].correctIndex ? acc + 1 : acc;
      }, 0);
      onComplete(correctCount);
    }
  };

  const progress = Math.round(((currentQuestionIndex + 1) / plan.quiz.length) * 100);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="flex-1 text-center px-4">
          <h2 className="font-lexend font-bold text-slate-900 leading-tight">Mastery Quiz</h2>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="w-6"></div>
      </div>

      <div className="p-8 flex-1">
        <div className="mb-10">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 block">Question {currentQuestionIndex + 1} of {plan.quiz.length}</span>
          <h3 className="text-xl font-bold text-slate-800 leading-snug">{currentQuestion.question}</h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${selectedOption === idx ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${selectedOption === idx ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 text-slate-300'}`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`font-medium ${selectedOption === idx ? 'text-blue-900' : 'text-slate-600'}`}>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 border-t bg-slate-50">
        <button
          disabled={selectedOption === null}
          onClick={handleNext}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${selectedOption === null ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-100 active:scale-95'}`}
        >
          {currentQuestionIndex === plan.quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
};

export default QuizModule;
