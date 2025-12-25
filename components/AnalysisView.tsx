
import React, { useState } from 'react';
import { analyzeTextScam, analyzeImageScam } from '../geminiService';
import { ScamAnalysisResult, ScamRiskLevel } from '../types';
import ResultDisplay from './ResultDisplay';

interface AnalysisViewProps {
  onResult: (result: ScamAnalysisResult) => void;
  result: ScamAnalysisResult | null;
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ onResult, result, onReset }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTextAnalysis = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyzeTextScam(inputText);
      onResult(res);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await analyzeImageScam(base64, file.type);
        onResult(res);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  if (result) {
    return <ResultDisplay result={result} onReset={onReset} />;
  }

  return (
    <div className="p-8 md:p-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Analysis</h2>
            <p className="text-slate-500">Paste text from a suspicious email, SMS, or DM.</p>
          </div>
          
          <textarea
            className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none bg-slate-50 text-slate-800 placeholder-slate-400"
            placeholder="Example: Your Amazon account has been suspended! Click here to verify your identity immediately..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <button
            onClick={handleTextAnalysis}
            disabled={isLoading || !inputText.trim()}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
              isLoading || !inputText.trim() 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            )}
            {isLoading ? 'Scanning...' : 'Analyze Text'}
          </button>
        </div>

        <div className="md:w-px bg-slate-100 hidden md:block" />

        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Screenshot Scan</h2>
            <p className="text-slate-500">Upload a photo of the message or website.</p>
          </div>

          <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 cursor-pointer hover:bg-slate-50 transition-colors bg-slate-50 group">
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-600">Click to upload or drag & drop</span>
            <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isLoading} />
          </label>
          
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
