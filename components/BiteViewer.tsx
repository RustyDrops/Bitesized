
import React, { useEffect, useRef, useState } from 'react';
import { LearningPlan, LearningBite } from '../types';
import { getLessonAudio } from '../services/geminiService';
import BiteChat from './BiteChat';

interface BiteViewerProps {
  plan: LearningPlan;
  biteId: string;
  onBack: () => void;
  onComplete: (biteId: string) => void;
  onNavigate: (biteId: string) => void;
  onUpdateTimeSpent: (biteId: string, seconds: number) => void;
}

const BiteViewer: React.FC<BiteViewerProps> = ({ plan, biteId, onBack, onComplete, onNavigate, onUpdateTimeSpent }) => {
  const bite = plan.bites.find(b => b.id === biteId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioCacheRef = useRef<Record<string, string>>({});
  
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
    
    startTimeRef.current = Date.now();
    stopAudio();
    setShowQuiz(false);
    setQuizStep(0);
    setSelectedOption(null);
    setQuizError(null);
    setQuizCompleted(!!bite?.completed);

    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0 && biteId) {
        onUpdateTimeSpent(biteId, timeSpent);
      }
    };
  }, [biteId, bite?.completed]);

  if (!bite) return null;

  const biteIndex = plan.bites.findIndex(b => b.id === biteId);
  const isLast = biteIndex === plan.bites.length - 1;
  const nextBite = isLast ? null : plan.bites[biteIndex + 1];
  const prevBite = biteIndex === 0 ? null : plan.bites[biteIndex - 1];

  const handleCompleteAndNext = () => {
    stopAudio();
    // Persist completion
    onComplete(bite.id);
    
    if (nextBite) {
      onNavigate(nextBite.id);
    } else {
      // It was the last bite - go back to dashboard where Mastery Quiz is now unlocked
      onBack();
    }
  };

  const handleQuizNext = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === bite.miniQuiz[quizStep].correctIndex;
    if (!isCorrect) {
      setQuizError("Not quite! Take another look at the lesson content.");
      setSelectedOption(null);
      return;
    }

    setQuizError(null);

    if (quizStep < bite.miniQuiz.length - 1) {
      setQuizStep(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizCompleted(true);
      setShowQuiz(false);
    }
  };

  const stopAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleReadAloud = async () => {
    if (isPlaying) { stopAudio(); return; }
    setIsPlaying(true);

    // Check cache first
    if (audioCacheRef.current[bite.id]) {
      playAudio(audioCacheRef.current[bite.id]);
      return;
    }

    const textToRead = `${bite.title}. ${bite.content.setup}. ${bite.content.explanation}. Analogy: ${bite.content.analogy}. Key Takeaway: ${bite.content.takeaway}`;
    try {
      const base64Audio = await getLessonAudio(textToRead);
      if (!base64Audio) { setIsPlaying(false); return; }

      // Cache it
      audioCacheRef.current[bite.id] = base64Audio;
      playAudio(base64Audio);
    } catch (e) { console.error("Audio error:", e); setIsPlaying(false); }
  };

  const playAudio = async (base64Audio: string) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await processAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (e) { console.error("Audio playback error:", e); setIsPlaying(false); }
  };

  return (
    <div ref={containerRef} className="flex-1 flex flex-col bg-white overflow-y-auto scrollbar-hide pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white border-b z-10 shadow-sm">
        <button onClick={onBack} className="text-slate-500 p-2 -ml-2 hover:bg-slate-50 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-1 text-center px-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Bite {biteIndex + 1} of {plan.totalBites}</span>
          <h2 className="font-lexend font-bold text-slate-900 line-clamp-1">{bite.title}</h2>
        </div>
        <button 
          onClick={handleReadAloud} 
          className={`p-2 rounded-full transition-colors shadow-sm ${isPlaying ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600'}`}
        >
          {isPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
        </button>
      </div>

      {!showQuiz ? (
        <div className="p-6 space-y-10 animate-fade-in">
          {/* Main Lesson Content */}
          <section className="space-y-4">
            <div className="w-12 h-1.5 bg-blue-600 rounded-full"></div>
            <p className="text-xl font-medium text-slate-800 leading-relaxed italic">"{bite.content.setup}"</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Core Insights</h3>
            <div className="text-slate-700 leading-relaxed space-y-4">
               {bite.content.explanation.split('\n\n').map((para, i) => (<p key={i}>{para}</p>))}
            </div>
          </section>

          <section className="bg-slate-50 p-6 rounded-2xl border-l-4 border-blue-500 shadow-sm">
             <div className="flex items-center gap-2 mb-3 text-blue-600">
               <span className="text-lg">💡</span>
               <h4 className="font-bold text-sm uppercase tracking-wide">Analogy</h4>
             </div>
             <p className="text-slate-700 leading-relaxed font-medium">{bite.content.analogy}</p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">In Action</h3>
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
               <div className="text-blue-400 mb-2 font-bold uppercase tracking-tighter text-[9px] opacity-70">// Example: {bite.example.title}</div>
               <div className="whitespace-pre-wrap">{bite.example.description}</div>
            </div>
          </section>

          <section className="bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-100">
            <h4 className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-2">Key Takeaway</h4>
            <p className="text-lg font-bold leading-tight">{bite.content.takeaway}</p>
          </section>

          {bite.miniProject && (
            <section className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛠️</span>
                  <h4 className="font-bold text-sm text-yellow-800 uppercase tracking-wide">Micro-Task</h4>
                </div>
                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded uppercase">{bite.miniProject.estimatedTime}</span>
              </div>
              <p className="font-bold text-slate-800">{bite.miniProject.goal}</p>
              <ul className="space-y-2">
                {bite.miniProject.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600">
                    <span className="font-bold text-yellow-600">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <div className="p-8 space-y-8 animate-slide-up bg-slate-50 min-h-[60vh] flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">❓</div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-2">Check Step {quizStep + 1} of 3</span>
            <h3 className="text-2xl font-lexend font-bold text-slate-800 leading-tight">{bite.miniQuiz[quizStep].question}</h3>
          </div>
          <div className="space-y-3">
            {bite.miniQuiz[quizStep].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedOption(idx);
                  setQuizError(null);
                }}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium ${selectedOption === idx ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md scale-[1.02]' : 'border-white bg-white text-slate-600 shadow-sm hover:border-slate-100'}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {quizError && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium animate-fade-in flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               {quizError}
             </div>
          )}
          <button 
            disabled={selectedOption === null}
            onClick={handleQuizNext}
            className="w-full bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-40 transition-all text-lg"
          >
            {quizStep === 2 ? 'Finalize Verification' : 'Next Check'}
          </button>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t p-4 flex gap-4 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        {!showQuiz ? (
          <>
            <div className="flex-1 flex gap-2">
              {prevBite ? (
                <button onClick={() => onNavigate(prevBite.id)} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all">Back</button>
              ) : (
                <button onClick={onBack} className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold transition-all">Dashboard</button>
              )}
              
              <button 
                onClick={quizCompleted ? handleCompleteAndNext : () => setShowQuiz(true)}
                className={`flex-1 font-bold py-4 rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${quizCompleted ? 'bg-green-600 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100'}`}
              >
                {quizCompleted ? (isLast ? 'Complete Path & Recap' : 'Next Lesson') : 'Verify Mastery'}
                {quizCompleted && !isLast && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /></svg>}
                {quizCompleted && isLast && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
              </button>
            </div>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner hover:bg-blue-100 transition-all"
              title="Chat with AI Tutor"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </button>
          </>
        ) : (
          <button onClick={() => setShowQuiz(false)} className="w-full text-slate-400 font-bold py-4 hover:text-slate-800 transition-colors">Return to Lesson</button>
        )}
      </div>

      {isChatOpen && <BiteChat topic={plan.topic} bite={bite} onClose={() => setIsChatOpen(false)} />}
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const processAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
  // Wrap raw PCM data in a WAV container to use native browser decoding
  // This avoids blocking the main thread with a manual JS loop
  const wavHeader = getWavHeader(data.length, sampleRate, numChannels);
  const blob = new Blob([wavHeader, data], { type: 'audio/wav' });
  const arrayBuffer = await blob.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
};

const getWavHeader = (dataLength: number, sampleRate: number, numChannels: number): ArrayBuffer => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export default BiteViewer;
