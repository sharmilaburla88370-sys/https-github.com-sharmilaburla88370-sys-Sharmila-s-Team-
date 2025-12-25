
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptionItem } from '../types';

// Helper functions for audio encoding/decoding moved outside component to follow guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
}

function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveGuardian: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([]);
  const [riskLevel, setRiskLevel] = useState<'low' | 'high'>('low');
  // Renamed from 'alert' to 'scamAlert' to avoid shadowing the global alert function (Fixes Error on line 117)
  const [scamAlert, setScamAlert] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  
  // Refs for gapless audio playback
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Auto-scroll transcriptions
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Initialize ai instance right before connect as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'You are an AI Guardian listening to a potential scam phone call. Your job is to listen quietly and only interrupt with a voice alert if you detect high-risk scam indicators like social engineering, requests for passwords, or sense of urgency. Keep your responses extremely brief and warning-focused.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsListening(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // Ensure data is sent only after connection is established
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => [...prev, { speaker: 'User', text, timestamp: Date.now() }]);
              // Simple logic for UI demo - if certain keywords appear, toggle risk
              if (text.toLowerCase().includes('password') || text.toLowerCase().includes('bank')) {
                setRiskLevel('high');
                setScamAlert('WARNING: Potential social engineering detected!');
              }
            }

            if (message.serverContent?.outputTranscription) {
               setTranscriptions(prev => [...prev, { speaker: 'AI', text: message.serverContent.outputTranscription.text || '', timestamp: Date.now() }]);
            }

            // Handle audio output using gapless playback logic
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                activeSourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
            }

            // Handle interruptions
            if (message.serverContent?.interrupted) {
              for (const source of activeSourcesRef.current.values()) {
                source.stop();
              }
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopListening(),
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopListening();
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      // Use window.alert here since it's an error outside the UI state management
      window.alert('Could not access microphone.');
    }
  };

  const stopListening = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (inputContextRef.current) inputContextRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
    setScamAlert(null);
    setRiskLevel('low');
    
    // Stop all active audio sources
    for (const source of activeSourcesRef.current.values()) {
      try { source.stop(); } catch(e) {}
    }
    activeSourcesRef.current.clear();
  };

  return (
    <div className="p-8 md:p-12 bg-slate-50 min-h-[500px] flex flex-col">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Live Guardian</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Activate the AI to listen to a conversation. It will analyze speech patterns in real-time and alert you if it detects red flags common in telephone scams.
          </p>
          
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-full py-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
            }`}
          >
            {isListening ? (
              <>
                <div className="flex gap-1">
                  <div className="w-1.5 h-6 bg-white animate-pulse" />
                  <div className="w-1.5 h-8 bg-white animate-pulse delay-75" />
                  <div className="w-1.5 h-6 bg-white animate-pulse delay-150" />
                </div>
                Stop Monitoring
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Start Guarding
              </>
            )}
          </button>

          {scamAlert && (
            <div className="mt-6 bg-red-600 text-white p-4 rounded-xl animate-bounce flex items-center gap-3 font-bold text-sm">
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {scamAlert}
            </div>
          )}
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col shadow-inner overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Transcription Stream</span>
            {isListening && <span className="flex items-center gap-1.5 text-xs font-semibold text-green-500"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> Analyzing Audio</span>}
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 h-[300px] overflow-y-auto p-6 space-y-4"
          >
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="font-medium">Voice transcriptions will appear here</p>
              </div>
            ) : (
              transcriptions.map((t, i) => (
                <div key={i} className={`flex ${t.speaker === 'AI' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm border ${
                    t.speaker === 'AI' 
                      ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-none' 
                      : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
                  }`}>
                    <span className="block text-[10px] opacity-60 mb-1 font-bold uppercase tracking-wider">{t.speaker}</span>
                    {t.text}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className={`h-2 transition-all duration-500 ${riskLevel === 'high' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-green-400'}`} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: '🔒', title: 'End-to-End Analysis', desc: 'Audio is processed and deleted instantly.' },
          { icon: '⚡', title: 'Low Latency', desc: 'Real-time detection using Native Audio.' },
          { icon: '🤖', title: 'Neutral Monitor', desc: 'The AI stays silent unless danger is imminent.' }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-3">
            <span className="text-xl">{feat.icon}</span>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{feat.title}</h4>
              <p className="text-xs text-slate-400">{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveGuardian;
