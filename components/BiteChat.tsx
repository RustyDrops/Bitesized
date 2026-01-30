
import React, { useState, useEffect, useRef } from 'react';
import { LearningBite } from '../types';
import { askBiteQuestion, getLessonAudio } from '../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface BiteChatProps {
  topic: string;
  bite: LearningBite;
  onClose: () => void;
}

const BiteChat: React.FC<BiteChatProps> = ({ topic, bite, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hi! I'm your tutor for "${topic}". Do you have any questions about "${bite.title}"?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const biteContent = `${bite.content.explanation} ${bite.content.analogy}`;
      const response = await askBiteQuestion(topic, biteContent, messageText);
      setMessages([...newMessages, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'ai', text: "Sorry, I ran into an error. Try again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
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

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleReadMessage = async (index: number, text: string) => {
    if (playingMessageIndex === index) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setPlayingMessageIndex(null);
      return;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setPlayingMessageIndex(index);

    try {
      const base64Audio = await getLessonAudio(text);
      if (!base64Audio) { setPlayingMessageIndex(null); return; }

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setPlayingMessageIndex(null);
      source.start();
    } catch (e) {
      console.error("Audio error:", e);
      setPlayingMessageIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end">
      <div className="bg-white rounded-t-3xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">🤖</div>
            <div>
              <h3 className="font-bold text-sm">Ask your Tutor</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Context: {bite.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm group relative ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}>
                {m.text}
                {m.role === 'ai' && (
                  <button
                    onClick={() => handleReadMessage(i, m.text)}
                    className={`absolute -bottom-3 -right-3 w-8 h-8 rounded-full shadow border border-slate-100 flex items-center justify-center transition-all ${playingMessageIndex === i ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 opacity-0 group-hover:opacity-100'}`}
                  >
                     {playingMessageIndex === i ? (
                       <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                     ) : (
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                     )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-1">
                <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white pb-8">
          <div className="flex gap-2">
            <button 
              onClick={startVoice}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-400 hover:text-blue-600'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </button>
            <input 
              type="text"
              placeholder="Type your question..."
              className="flex-1 bg-slate-100 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>
    </div>
  );
};

export default BiteChat;
