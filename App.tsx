
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AnalysisView from './components/AnalysisView';
import LiveGuardian from './components/LiveGuardian';
import EducationSection from './components/EducationSection';
import { ScamAnalysisResult } from './types';

const App: React.FCimp = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'live' | 'education'>('analyze');
  const [lastResult, setLastResult] = useState<ScamAnalysisResult | null>(null);

  const handleAnalysisComplete = useCallback((result: ScamAnalysisResult) => {
    setLastResult(result);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow pb-20">
        <Hero />
        
        <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {activeTab === 'analyze' && (
              <AnalysisView 
                onResult={handleAnalysisComplete} 
                result={lastResult} 
                onReset={() => setLastResult(null)}
              />
            )}
            
            {activeTab === 'live' && (
              <LiveGuardian />
            )}
            
            {activeTab === 'education' && (
              <EducationSection />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="text-white font-bold mb-4">ScamGuard AI</h3>
            <p>Advanced real-time protection powered by Google Gemini. Our mission is to eliminate digital fraud one scan at a time.</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Powered By</h3>
            <p>Gemini 3 Pro & Flash<br />Google GenAI SDK</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center">
          &copy; {new Date().getFullYear()} ScamGuard AI. Protected by Advanced Neural Detection.
        </div>
      </footer>
    </div>
  );
};

export default App;
