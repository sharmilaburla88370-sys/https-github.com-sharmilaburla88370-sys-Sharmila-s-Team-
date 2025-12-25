
export enum ScamRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ScamAnalysisResult {
  score: number; // 0-100
  riskLevel: ScamRiskLevel;
  summary: string;
  redFlags: string[];
  recommendedActions: string[];
  isScam: boolean;
  confidence: number;
}

export interface TranscriptionItem {
  speaker: 'User' | 'AI';
  text: string;
  timestamp: number;
}
