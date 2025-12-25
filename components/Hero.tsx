
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="gradient-bg pt-20 pb-28 text-center text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wider uppercase mb-6">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Powered by Gemini 3 Flash
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          Stop Scams Before <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">They Stop You.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto font-light">
          Upload suspicious messages, screenshots, or analyze live calls to detect phishing, social engineering, and fraudulent activity with 99.8% precision.
        </p>
      </div>
    </section>
  );
};

export default Hero;
