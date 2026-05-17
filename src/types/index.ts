import type { Language } from '@/constants/strings';

// ---------------------------------------------------------------------------
// Risk
// ---------------------------------------------------------------------------
export type RiskScore = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK' | 'SCAM';
export type GrammarQuality = 'GOOD' | 'POOR' | 'VERY_POOR';

// ---------------------------------------------------------------------------
// Report sections (mirrors REPORT_STRUCTURE.md)
// ---------------------------------------------------------------------------
export interface UniversityVerification {
  name: string;
  country: string;
  foundedYear: string;
  isAccredited: boolean | null;
  accreditationBody: string;
  registrationNumber: string;
  officialWebsite: string;
  websiteMatch: boolean;
  ugcRecognized: boolean | null;
  worldRanking: string;
  verdict: string;
}

export interface OfferLetterAnalysis {
  hasOfficialLetterhead: boolean;
  emailDomainLegitimate: boolean;
  detectedEmail: string;
  hasDigitalSignature: boolean;
  grammarQuality: GrammarQuality;
  suspiciousElements: string[];
  verdict: string;
}

export interface InvoiceAnalysis {
  found: boolean;
  paymentDestination: string;
  isPersonalAccount: boolean;
  amountReasonable: boolean;
  currency: string;
  paymentMethod: string;
  suspiciousElements: string[];
  verdict: string;
}

// Full structured report returned by Claude API
export interface AnalysisReport {
  riskScore: RiskScore;
  riskPercentage: number;        // 0–100
  summary: string;
  universityVerification: UniversityVerification;
  offerLetterAnalysis: OfferLetterAnalysis;
  invoiceAnalysis: InvoiceAnalysis;
  redFlags: string[];
  positivePoints: string[];
  recommendedActions: string[];
  disclaimer: string;
}

// ---------------------------------------------------------------------------
// Storage (mirrors STORAGE.md)
// ---------------------------------------------------------------------------

// Lightweight record stored in "reports_list"
export interface ReportListItem {
  id: string;                    // UUID
  createdAt: string;             // ISO date string
  title: string;                 // University name or document name
  riskScore: RiskScore;
  language: Language;
}

// Full record stored at "report_{id}"
export interface FullReport extends ReportListItem {
  analysis: AnalysisReport;
  fileNames: string[];           // original uploaded file names
  paymentTransactionId: string;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------
export interface UploadedFile {
  uri: string;
  name: string;
  mimeType: 'image/jpeg' | 'image/png' | 'application/pdf';
  size: number;                  // bytes
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------
export interface PaymentDetails {
  bkashNumber: string;
  transactionId: string;
  amount: number;
  verifiedAt: string;            // ISO date string
}

// ---------------------------------------------------------------------------
// Analysis request passed to service layer
// ---------------------------------------------------------------------------
export interface AnalysisRequest {
  files: UploadedFile[];
  language: Language;
  payment: PaymentDetails;
}

// ---------------------------------------------------------------------------
// Service response wrappers
// ---------------------------------------------------------------------------
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
