
import React from 'react';
import { ScamAnalysisResult, ScamRiskLevel } from '../types';

interface ResultDisplayProps {
  result: ScamAnalysisResult;
  onReset: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const getRiskColor = (level: ScamRiskLevel) => {
    switch (level) {
      case ScamRiskLevel.LOW: return 'text-green-600 bg-green-50 border-green-200';
      case ScamRiskLevel.MEDIUM: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ScamRiskLevel.HIGH: return 'text-orange-600 bg-orange-50 border-orange-200';
      case ScamRiskLevel.CRITICAL: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getRiskProgressColor = (level: ScamRiskLevel) => {
    switch (level) {
      case ScamRiskLevel.LOW: return 'bg-green-500';
      case ScamRiskLevel.MEDIUM: return 'bg-yellow-500';
      case ScamRiskLevel.HIGH: return 'bg-orange-500';
      case ScamRiskLevel.CRITICAL: return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-1">Risk Assessment</h2>
          <p className="text-slate-500">Analysis completed with {Math.round(result.confidence * 100)}% confidence</p>
        </div>
        <button 
          onClick={onReset}
          className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 group"
        >
          <svg className="w-5 h-5 group-hover:-rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Scan Another
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className={`p-6 rounded-2xl border-2 ${getRiskColor(result.riskLevel)}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">
                {result.isScam ? '⚠️' : '✅'}
              </span>
              <h3 className="text-xl font-bold uppercase tracking-wider">{result.riskLevel} Risk Detected</h3>
            </div>
            <p className="text-slate-800 font-medium leading-relaxed">{result.summary}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Identified Red Flags
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                  <span className="text-sm text-slate-700">{flag}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Recommended Actions
            </h3>
            <ul className="space-y-3">
              {result.recommendedActions.map((action, i) => (
                <li key={i} className="flex items-center gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm font-medium">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 h-fit">
          <h3 className="text-center font-bold text-slate-800 mb-6">Threat Severity</h3>
          <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" className="stroke-slate-200" strokeWidth="12" fill="none" />
              <circle 
                cx="96" cy="96" r="88" 
                className={`transition-all duration-1000 ${getRiskProgressColor(result.riskLevel)}`}
                strokeWidth="12" 
                fill="none" 
                strokeDasharray={552}
                strokeDashoffset={552 - (552 * result.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900">{result.score}</span>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Risk Score</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Safe</span>
              <span>Dangerous</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
               <div className="h-full bg-green-400 w-1/4" />
               <div className="h-full bg-yellow-400 w-1/4" />
               <div className="h-full bg-orange-400 w-1/4" />
               <div className="h-full bg-red-400 w-1/4" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              This assessment is powered by AI and should be used as a guide. If you've shared personal info, contact your bank immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
