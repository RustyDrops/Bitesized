
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onHome?: () => void;
  onProfile?: () => void;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onHome, onProfile, hideHeader = false, hideFooter = false }) => {
  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl overflow-hidden relative">
      {!hideHeader && (
        <header className="px-6 py-4 flex items-center justify-between border-b bg-white z-50 shadow-sm flex-shrink-0">
          <button onClick={onHome} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-xs">BL</span>
            </div>
            <span className="font-lexend font-bold text-lg text-slate-800">Bite Sized</span>
          </button>

          {user && (
            <div className="flex items-center gap-4">
              <button onClick={onHome} className="text-slate-500 hover:text-blue-600" title="Home">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
              {onProfile && (
                <button onClick={onProfile} className="text-slate-500 hover:text-blue-600" title="Profile">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </button>
              )}
              <button
                  onClick={onLogout}
                  className="text-slate-400 text-xs font-bold uppercase hover:text-slate-800"
                >
                  Logout
                </button>
            </div>
          )}
        </header>
      )}
      
      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        {children}
      </main>
      
      {!hideFooter && (
        <footer className="px-6 py-4 text-center border-t bg-slate-50 flex-shrink-0 z-10">
          <p className="text-xs text-slate-400">Powered by Gemini 3 Flash &copy; 2024</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;
