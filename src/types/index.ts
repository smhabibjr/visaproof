export type Language = 'bn' | 'en';

// ---------------------------------------------------------------------------
// Risk / quality enums
// ---------------------------------------------------------------------------
export type RiskScore          = 'SAFE' | 'SUSPICIOUS' | 'HIGH_RISK' | 'SCAM';
export type GrammarQuality     = 'GOOD' | 'POOR' | 'VERY_POOR';
export type InstitutionType    = 'University' | 'College' | 'Institute' | 'VET' | 'Academy' | 'Other';
export type ProgrammeLevel     = 'Certificate' | 'Diploma' | 'Bachelor' | 'Master' | 'PhD' | 'Foundation' | 'VET';
export type BankType           = 'MAJOR_BANK' | 'FINTECH' | 'ONLINE_ONLY' | 'COOPERATIVE' | 'UNKNOWN';
export type FeeLevel           = 'LOW' | 'REASONABLE' | 'HIGH' | 'UNKNOWN';
export type EmployabilityLevel = 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN';
export type ConditionalType    = 'CONDITIONAL' | 'FULL' | 'UNCLEAR';

// ---------------------------------------------------------------------------
// Shared sub-types
// ---------------------------------------------------------------------------
export interface VerificationLink {
  label: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Report sections (mirrors REPORT_STRUCTURE.md)
// ---------------------------------------------------------------------------

export interface CrossDocumentCheck {
  documentsAnalyzed: number;
  nameConsistent: boolean | null;
  studentDetailsConsistent: boolean | null;
  bankDetailsConsistent: boolean | null;
  datesLogical: boolean | null;
  currencyConsistent: boolean | null;
  programmeNameConsistent: boolean | null;
  inconsistencies: string[];
  verdict: string;
}

export interface UniversityVerification {
  name: string;
  country: string;
  foundedYear: string | null;
  institutionType: InstitutionType;
  isAccredited: boolean | null;
  nationalAccreditor: string | null;
  accreditationBody: string | null;
  registrationNumber: string | null;
  officialWebsite: string | null;
  websiteMatch: boolean | null;
  ugcRecognized: boolean | null;
  ugcNote: string;
  worldRanking: string | null;
  programmeOffered: string;
  programmeDuration: string;
  programmeLevel: ProgrammeLevel;
  programmeFeeReasonable: boolean | null;
  feeComparisonNote: string;
  verificationLinks: VerificationLink[];
  verdict: string;
}

export interface OfferLetterAnalysis {
  found: boolean;
  hasOfficialLetterhead: boolean | null;
  namedSignatory: boolean;
  signatoryName: string | null;
  signatoryTitle: string | null;
  hasSignatureOrSeal: boolean | null;
  hasDigitalSignature?: boolean | null;   // legacy field — kept for old stored reports
  emailDomainLegitimate: boolean | null;
  detectedEmail: string | null;
  hasReferenceNumber: boolean | null;
  referenceNumber: string | null;
  hasVerificationLink: boolean;
  verificationLink: string | null;
  studentNameInGreeting: boolean | null;
  grammarQuality: GrammarQuality;
  hasTermsAndConditions: boolean | null;
  urgencyLanguageDetected: boolean;
  conditionalOrFull: ConditionalType;
  conditionsSpecified: boolean | null;
  conditionsSummary: string | null;
  scholarshipDetails: string | null;
  scholarshipPressure: boolean;
  suspiciousElements: string[];
  positiveElements: string[];
  verdict: string;
}

export interface InvoiceAnalysis {
  found: boolean;
  invoiceNumber: string | null;
  paymentDestination: string | null;
  bankName: string | null;
  bankType: BankType;
  bankCountry: string | null;
  accountHolderName: string | null;
  accountHolderMatchesInstitution: boolean | null;
  iban: string | null;
  ibanCountryPrefix: string | null;
  ibanCountryMatchesInstitution: boolean | null;
  isPersonalAccount: boolean | null;
  totalAmount: string | null;
  currency: string | null;
  amountReasonable: boolean | null;
  paymentDeadlineDays: number | null;
  paymentDeadlinePressure: boolean;
  nonRefundableFees: string | null;
  nonRefundablePercentage: number | null;
  nonRefundableExcessive: boolean | null;
  paymentMethod: string | null;
  legitimatePaymentPlatform: boolean | null;
  platformName: string | null;
  installmentOptionAvailable: boolean | null;
  refundPolicyPresent: boolean | null;
  refundPolicySummary: string | null;
  suspiciousElements: string[];
  positiveElements: string[];
  verdict: string;
}

export interface AgentVerification {
  agentFound: boolean;
  agentName: string | null;
  agentCompany: string | null;
  maraRegistered: boolean | null;
  icefCertified: boolean | null;
  bmetRegistered: boolean | null;
  agentPressureTacticsDetected: boolean;
  agentFeesInDocs: boolean;
  separateAgentFeesConcern: boolean;
  verdict: string | null;
}

export interface ProgrammeAnalysis {
  programmeName: string;
  programmeLevel: string;
  qualificationFrameworkLevel: string | null;
  isVETNotDegree: boolean | null;
  vetWarning: string | null;
  isTopUpDegree: boolean | null;
  topUpWarning: string | null;
  isFoundationProgramme: boolean | null;
  foundationNote: string | null;
  bangladeshRecognitionConcern: boolean;
  recognitionNote: string;
  durationReasonable: boolean | null;
  feeVsCountryAverage: FeeLevel;
  feeNote: string;
  prPathwayConcern: boolean;
  prPathwayNote: string | null;
  employabilityInBangladesh: EmployabilityLevel;
  employabilityNote: string;
  verdict: string;
}

export interface BangladeshSpecificRisks {
  commonScamPatternDetected: boolean;
  patternType: string | null;
  patternDescription: string | null;
  guaranteedVisaLanguage: boolean;
  separateAgentFeesFound: boolean;
  contactVerifiableIndependently: boolean | null;
  websiteSeemsLegitimate: boolean | null;
  overallBDRiskNote: string;
}

// Full structured report returned by Claude API
export interface AnalysisReport {
  riskScore: RiskScore;
  riskPercentage: number;
  language?: Language;                              // optional — old reports may lack
  summary: string;
  institutionName?: string;                         // optional — old reports may lack
  generatedAt?: string;                             // optional — old reports may lack
  crossDocumentCheck?: CrossDocumentCheck;          // optional — old reports may lack
  universityVerification: UniversityVerification;
  offerLetterAnalysis: OfferLetterAnalysis;
  invoiceAnalysis: InvoiceAnalysis;
  agentVerification?: AgentVerification;            // optional — old reports may lack
  programmeAnalysis?: ProgrammeAnalysis;            // optional — old reports may lack
  bangladeshSpecificRisks?: BangladeshSpecificRisks; // optional — old reports may lack
  redFlags: string[];
  positivePoints: string[];
  recommendedActions: string[];
  officialVerificationLinks?: VerificationLink[];   // optional — old reports may lack
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
// Validation
// ---------------------------------------------------------------------------
export type ValidationStatus = 'checking' | 'ready' | 'error';

export interface ValidationResult {
  isReadable: boolean;
  reason: string;    // short key (e.g. 'ok', 'too_small', 'pdf_empty')
  reasonBn: string;  // Bengali message shown to user
  reasonEn: string;  // English message shown to user
  checkedAt: string; // ISO date string
}

export interface ValidatedFile extends UploadedFile {
  id: string;
  validationStatus: ValidationStatus;
  validationResult?: ValidationResult;
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

// Payment skip করে সরাসরি analysis এর জন্য (Feature 6)
export interface AnalyzeParams {
  files: UploadedFile[];
  language: Language;
  reportId: string;
}

// ---------------------------------------------------------------------------
// Service response wrappers
// ---------------------------------------------------------------------------
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
