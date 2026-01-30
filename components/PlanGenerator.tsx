
import React, { useEffect, useState } from 'react';

const PlanGenerator: React.FC<{ message: string }> = ({ message }) => {
  const [dots, setDots] = useState('');
  
  const statusMessages = [
    "Analyzing the topic...",
    "Breaking down complex concepts...",
    "Crafting relatable analogies...",
    "Setting up micro-projects...",
    "Finding the best resources...",
    "Polishing your bitesized lessons...",
  ];

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const statusInterval = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statusMessages.length);
    }, 3000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
      <div className="mb-12 relative">
        <div className="w-24 h-24 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🧠</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-lexend font-bold text-slate-800 mb-2">Creating your plan{dots}</h2>
      <p className="text-slate-500 text-lg">{statusMessages[statusIndex]}</p>
      
      <div className="mt-12 max-w-xs w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full animate-[loading_15s_ease-in-out_infinite]" style={{ width: '60%' }}></div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PlanGenerator;
