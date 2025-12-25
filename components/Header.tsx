
import React from 'react';

interface HeaderProps {
  activeTab: 'analyze' | 'live' | 'education';
  onTabChange: (tab: 'analyze' | 'live' | 'education') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm text-white px-6 py-4 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <span className="font-bold text-xl tracking-tight">ScamGuard <span className="text-indigo-400">AI</span></span>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <button 
          onClick={() => onTabChange('analyze')}
          className={`text-sm font-medium transition-colors ${activeTab === 'analyze' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
        >
          Message Analysis
        </button>
        <button 
          onClick={() => onTabChange('live')}
          className={`text-sm font-medium transition-colors ${activeTab === 'live' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
        >
          Live Guardian
        </button>
        <button 
          onClick={() => onTabChange('education')}
          className={`text-sm font-medium transition-colors ${activeTab === 'education' ? 'text-indigo-400' : 'text-slate-300 hover:text-white'}`}
        >
          Red Flags
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all active:scale-95">
          Get Protection
        </button>
      </div>
    </header>
  );
};

export default Header;
