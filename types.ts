
export interface ActionStep {
  phase: 'Phase 1: Fix Immediately' | 'Phase 2: Improve Next' | 'Phase 3: Optional Enhancements';
  task: string;
  effort: 'Low' | 'Medium' | 'High';
}

export interface DomainLicense {
  id: string;
  domain: string;
  purchasedAt: number;
  auditCount: number;
  userId: string;
}

export interface CryptoPayment {
  id: string;
  userId: string;
  token: 'VEC';
  network: 'testnet' | 'mainnet';
  transactionHash: string;
  amount: number;
  usdValue: number;
  status: 'pending' | 'confirmed' | 'failed' | 'manual_verification_pending';
  licenseId?: string;
  createdAt: number;
}

export interface AuditReportData {
  auditId: string;
  auditDate: string;
  engineClass: string;
  verificationHash: string;
  planType?: 'Free' | 'Basic' | 'Pro' | 'Agency';
  licenseId?: string;
  overview: {
    websiteName: string;
    url: string;
    websiteUrl?: string;
  };
  executiveSummary: {
    score: number;
    verdict: string;
    summary: string;
    decisionLine: string;
  };
  scoreBreakdown: Array<{
    label: string;
    meaning: string;
    score: number;
  }>;
  gapBreakdown: Array<{
    category: string;
    deduction: number;
    evidence: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
  }>;
  pathToPerfect: Array<{
    task: string;
    reason: string;
    projectedImpact: number;
  }>;
  industryComparison: {
    percentile: number;
    averageScore: number;
    topFivePercentScore: number;
    standing: string;
  };
  roiForecast: {
    estimatedLift: string;
    confidenceLevel: string;
    primaryGrowthDriver: string;
  };
  strengths: Array<{
    point: string;
    businessValue: string;
    impact: string;
  }>;
  criticalIssues: Array<{
    severity: 'Critical' | 'Important' | 'Standard';
    title: string;
    urgency: 'Immediate' | 'Soon' | 'Planned';
    explanation: string;
  }>;
  actionPlan: ActionStep[];
}

export interface AuditInput {
  url: string;
  description?: string;
  image?: string; // base64
}

export interface AuditRecord {
  id: string;
  timestamp: number;
  url: string;
  industry: string;
  description?: string;
  data: AuditReportData;
  operatorSnapshot?: string; // base64 image
  userId?: string;
}

export type View = 'home' | 'audit' | 'loading' | 'report' | 'pricing' | 'docs' | 'vault' | 'branding' | 'privacy' | 'terms' | 'auth' | 'profile' | 'standards' | 'verify';

export interface User {
  id: string;
  email: string;
  tier: 'Free' | 'Basic' | 'Pro' | 'Agency';
  name?: string;
  joinedDate?: string;
  avatar?: string;
  vecBalance?: number;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
    Paddle: any;
  }
}
