# REPORT_STRUCTURE.md — VisaProof Report JSON Structure

## Overview
This is the complete JSON structure that Claude API must return.
Used in: claudeService.ts (prompt), types/index.ts (TypeScript),
ReportScreen.tsx (display), pdfService.ts (PDF generation).

---

## Complete JSON Structure

```json
{
  "riskScore": "SAFE | SUSPICIOUS | HIGH_RISK | SCAM",
  "riskPercentage": 0,
  "language": "bn | en",
  "summary": "Comprehensive 2-4 sentence summary of overall finding",
  "institutionName": "Extracted institution name",
  "generatedAt": "ISO date string",

  "crossDocumentCheck": {
    "documentsAnalyzed": 0,
    "nameConsistent": true,
    "studentDetailsConsistent": true,
    "bankDetailsConsistent": true,
    "datesLogical": true,
    "currencyConsistent": true,
    "programmeNameConsistent": true,
    "inconsistencies": [],
    "verdict": "All documents are consistent / X inconsistencies found"
  },

  "universityVerification": {
    "name": "Full institution name",
    "country": "Country name",
    "foundedYear": "Year or null",
    "institutionType": "University | College | Institute | VET | Academy | Other",
    "isAccredited": true,
    "nationalAccreditor": "TEQSA | QAA | RNCP | MFHEA | AQ Austria | QQI | MQA | Other",
    "accreditationBody": "Full official name of accreditation body",
    "registrationNumber": "Registration or accreditation number",
    "officialWebsite": "www.example.edu",
    "websiteMatch": true,
    "ugcRecognized": false,
    "ugcNote": "UGC only applies to BD institutions. N/A for foreign universities.",
    "worldRanking": "QS Rank or null if not ranked",
    "programmeOffered": "Exact programme name from document",
    "programmeDuration": "Duration as stated",
    "programmeLevel": "Certificate | Diploma | Bachelor | Master | PhD | Foundation | VET",
    "programmeFeeReasonable": true,
    "feeComparisonNote": "Fee is within/above/below typical range for this country and level",
    "verificationLinks": [
      {
        "label": "Verify on TEQSA",
        "url": "https://www.teqsa.gov.au/national-register"
      }
    ],
    "verdict": "Institution verdict paragraph"
  },

  "offerLetterAnalysis": {
    "found": true,
    "hasOfficialLetterhead": true,
    "namedSignatory": true,
    "signatoryName": "Full name or null",
    "signatoryTitle": "Title/position or null",
    "hasSignatureOrSeal": true,
    "emailDomainLegitimate": true,
    "detectedEmail": "email@institution.edu or null",
    "hasReferenceNumber": true,
    "referenceNumber": "Reference number or null",
    "hasVerificationLink": false,
    "verificationLink": "URL or null",
    "studentNameInGreeting": true,
    "grammarQuality": "GOOD | POOR | VERY_POOR",
    "hasTermsAndConditions": true,
    "urgencyLanguageDetected": false,
    "conditionalOrFull": "CONDITIONAL | FULL | UNCLEAR",
    "conditionsSpecified": true,
    "conditionsSummary": "Brief summary of conditions or null",
    "scholarshipDetails": "Scholarship info if present or null",
    "scholarshipPressure": false,
    "suspiciousElements": [
      "Suspicious element 1",
      "Suspicious element 2"
    ],
    "positiveElements": [
      "Positive element 1"
    ],
    "verdict": "Offer letter verdict paragraph"
  },

  "invoiceAnalysis": {
    "found": true,
    "invoiceNumber": "Invoice number or null",
    "paymentDestination": "Bank name and account details",
    "bankName": "Bank name",
    "bankType": "MAJOR_BANK | FINTECH | ONLINE_ONLY | COOPERATIVE | UNKNOWN",
    "bankCountry": "Country where bank is registered",
    "accountHolderName": "Account holder name",
    "accountHolderMatchesInstitution": true,
    "iban": "Full IBAN or null",
    "ibanCountryPrefix": "Two letter country code e.g. AT, FR, MT",
    "ibanCountryMatchesInstitution": true,
    "isPersonalAccount": false,
    "totalAmount": "Amount with currency",
    "currency": "EUR | AUD | GBP | CAD | USD | etc",
    "amountReasonable": true,
    "paymentDeadlineDays": 14,
    "paymentDeadlinePressure": false,
    "nonRefundableFees": "Amount or null",
    "nonRefundablePercentage": 5.0,
    "nonRefundableExcessive": false,
    "paymentMethod": "Bank transfer | Flywire | Stripe | Other",
    "legitimatePaymentPlatform": true,
    "platformName": "Platform name if used",
    "installmentOptionAvailable": true,
    "refundPolicyPresent": true,
    "refundPolicySummary": "Brief refund policy summary",
    "suspiciousElements": [
      "Suspicious payment element"
    ],
    "positiveElements": [
      "Positive payment element"
    ],
    "verdict": "Invoice verdict paragraph"
  },

  "agentVerification": {
    "agentFound": false,
    "agentName": "Agent person name or null",
    "agentCompany": "Agency company name or null",
    "maraRegistered": null,
    "icefCertified": null,
    "bmetRegistered": null,
    "agentPressureTacticsDetected": false,
    "agentFeesInDocs": false,
    "separateAgentFeesConcern": false,
    "verdict": "Agent verdict or null if no agent"
  },

  "programmeAnalysis": {
    "programmeName": "Full programme name",
    "programmeLevel": "Level description",
    "qualificationFrameworkLevel": "Level number e.g. MQF 6, AQF 5",
    "isVETNotDegree": false,
    "vetWarning": null,
    "isTopUpDegree": false,
    "topUpWarning": null,
    "isFoundationProgramme": false,
    "foundationNote": null,
    "bangladeshRecognitionConcern": false,
    "recognitionNote": "Note about recognition in Bangladesh",
    "durationReasonable": true,
    "feeVsCountryAverage": "LOW | REASONABLE | HIGH | UNKNOWN",
    "feeNote": "Context about fee level",
    "prPathwayConcern": false,
    "prPathwayNote": null,
    "employabilityInBangladesh": "HIGH | MODERATE | LOW | UNCERTAIN",
    "employabilityNote": "Note about degree value for BD job market",
    "verdict": "Programme verdict paragraph"
  },

  "bangladeshSpecificRisks": {
    "commonScamPatternDetected": false,
    "patternType": "Pattern name or null",
    "patternDescription": "Description or null",
    "guaranteedVisaLanguage": false,
    "separateAgentFeesFound": false,
    "contactVerifiableIndependently": true,
    "websiteSeemsLegitimate": true,
    "overallBDRiskNote": "Overall note specific to BD student context"
  },

  "redFlags": [
    "Specific red flag with detail 1",
    "Specific red flag with detail 2"
  ],

  "positivePoints": [
    "Specific positive point 1",
    "Specific positive point 2"
  ],

  "recommendedActions": [
    "Specific action 1 with detail and why",
    "Specific action 2 with detail and why"
  ],

  "officialVerificationLinks": [
    {
      "label": "Check CRICOS registration (Australia)",
      "url": "https://cricos.education.gov.au"
    },
    {
      "label": "Check TEQSA National Register",
      "url": "https://www.teqsa.gov.au/national-register"
    }
  ],

  "disclaimer": "This report was generated using AI analysis and may occasionally be incorrect. Always verify through official channels before making any financial commitment."
}
```

---

## TypeScript Interface (for types/index.ts)

```typescript
export type RiskScore = "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM"
export type Language = "bn" | "en"
export type InstitutionType = "University" | "College" | "Institute" | "VET" | "Academy" | "Other"
export type ProgrammeLevel = "Certificate" | "Diploma" | "Bachelor" | "Master" | "PhD" | "Foundation" | "VET"
export type GrammarQuality = "GOOD" | "POOR" | "VERY_POOR"
export type BankType = "MAJOR_BANK" | "FINTECH" | "ONLINE_ONLY" | "COOPERATIVE" | "UNKNOWN"
export type FeeLevel = "LOW" | "REASONABLE" | "HIGH" | "UNKNOWN"
export type EmployabilityLevel = "HIGH" | "MODERATE" | "LOW" | "UNCERTAIN"
export type ConditionalType = "CONDITIONAL" | "FULL" | "UNCLEAR"

export interface VerificationLink {
  label: string
  url: string
}

export interface CrossDocumentCheck {
  documentsAnalyzed: number
  nameConsistent: boolean | null
  studentDetailsConsistent: boolean | null
  bankDetailsConsistent: boolean | null
  datesLogical: boolean | null
  currencyConsistent: boolean | null
  programmeNameConsistent: boolean | null
  inconsistencies: string[]
  verdict: string
}

export interface UniversityVerification {
  name: string
  country: string
  foundedYear: string | null
  institutionType: InstitutionType
  isAccredited: boolean | null
  nationalAccreditor: string | null
  accreditationBody: string | null
  registrationNumber: string | null
  officialWebsite: string | null
  websiteMatch: boolean | null
  ugcRecognized: boolean | null
  ugcNote: string
  worldRanking: string | null
  programmeOffered: string
  programmeDuration: string
  programmeLevel: ProgrammeLevel
  programmeFeeReasonable: boolean | null
  feeComparisonNote: string
  verificationLinks: VerificationLink[]
  verdict: string
}

export interface OfferLetterAnalysis {
  found: boolean
  hasOfficialLetterhead: boolean | null
  namedSignatory: boolean
  signatoryName: string | null
  signatoryTitle: string | null
  hasSignatureOrSeal: boolean | null
  emailDomainLegitimate: boolean | null
  detectedEmail: string | null
  hasReferenceNumber: boolean | null
  referenceNumber: string | null
  hasVerificationLink: boolean
  verificationLink: string | null
  studentNameInGreeting: boolean | null
  grammarQuality: GrammarQuality
  hasTermsAndConditions: boolean | null
  urgencyLanguageDetected: boolean
  conditionalOrFull: ConditionalType
  conditionsSpecified: boolean | null
  conditionsSummary: string | null
  scholarshipDetails: string | null
  scholarshipPressure: boolean
  suspiciousElements: string[]
  positiveElements: string[]
  verdict: string
}

export interface InvoiceAnalysis {
  found: boolean
  invoiceNumber: string | null
  paymentDestination: string | null
  bankName: string | null
  bankType: BankType
  bankCountry: string | null
  accountHolderName: string | null
  accountHolderMatchesInstitution: boolean | null
  iban: string | null
  ibanCountryPrefix: string | null
  ibanCountryMatchesInstitution: boolean | null
  isPersonalAccount: boolean | null
  totalAmount: string | null
  currency: string | null
  amountReasonable: boolean | null
  paymentDeadlineDays: number | null
  paymentDeadlinePressure: boolean
  nonRefundableFees: string | null
  nonRefundablePercentage: number | null
  nonRefundableExcessive: boolean | null
  paymentMethod: string | null
  legitimatePaymentPlatform: boolean | null
  platformName: string | null
  installmentOptionAvailable: boolean | null
  refundPolicyPresent: boolean | null
  refundPolicySummary: string | null
  suspiciousElements: string[]
  positiveElements: string[]
  verdict: string
}

export interface AgentVerification {
  agentFound: boolean
  agentName: string | null
  agentCompany: string | null
  maraRegistered: boolean | null
  icefCertified: boolean | null
  bmetRegistered: boolean | null
  agentPressureTacticsDetected: boolean
  agentFeesInDocs: boolean
  separateAgentFeesConcern: boolean
  verdict: string | null
}

export interface ProgrammeAnalysis {
  programmeName: string
  programmeLevel: string
  qualificationFrameworkLevel: string | null
  isVETNotDegree: boolean | null
  vetWarning: string | null
  isTopUpDegree: boolean | null
  topUpWarning: string | null
  isFoundationProgramme: boolean | null
  foundationNote: string | null
  bangladeshRecognitionConcern: boolean
  recognitionNote: string
  durationReasonable: boolean | null
  feeVsCountryAverage: FeeLevel
  feeNote: string
  prPathwayConcern: boolean
  prPathwayNote: string | null
  employabilityInBangladesh: EmployabilityLevel
  employabilityNote: string
  verdict: string
}

export interface BangladeshSpecificRisks {
  commonScamPatternDetected: boolean
  patternType: string | null
  patternDescription: string | null
  guaranteedVisaLanguage: boolean
  separateAgentFeesFound: boolean
  contactVerifiableIndependently: boolean | null
  websiteSeemsLegitimate: boolean | null
  overallBDRiskNote: string
}

export interface ReportAnalysis {
  riskScore: RiskScore
  riskPercentage: number
  language: Language
  summary: string
  institutionName: string
  generatedAt: string
  crossDocumentCheck: CrossDocumentCheck
  universityVerification: UniversityVerification
  offerLetterAnalysis: OfferLetterAnalysis
  invoiceAnalysis: InvoiceAnalysis
  agentVerification: AgentVerification
  programmeAnalysis: ProgrammeAnalysis
  bangladeshSpecificRisks: BangladeshSpecificRisks
  redFlags: string[]
  positivePoints: string[]
  recommendedActions: string[]
  officialVerificationLinks: VerificationLink[]
  disclaimer: string
}
```

---

## Risk Score Quick Reference

| Score | Range | Trigger Conditions |
|---|---|---|
| SCAM | 85-100% | Different bank accounts across docs, personal account, institution not found, guaranteed visa |
| HIGH_RISK | 60-84% | Fintech bank, IBAN mismatch, account name mismatch, no signatory, deadline < 7 days |
| SUSPICIOUS | 35-59% | Unknown institution, 7-14 day deadline, urgency language, missing doc elements |
| SAFE | 0-34% | All checks pass, major bank, named signatory, known accredited institution |

---

## Section Display Order (ReportScreen + PDF)

```
1.  Risk Score Header (banner)
2.  Summary
3.  Cross Document Check ← NEW
4.  University Verification
5.  Programme Analysis ← NEW
6.  Offer Letter Analysis
7.  Invoice Analysis
8.  Agent Verification (only if agentFound=true) ← NEW
9.  Bangladesh Specific Risks ← NEW
10. Red Flags + Positive Points
11. Recommended Actions
12. Official Verification Links ← NEW (tappable)
13. Disclaimer
14. App Promo Strip
15. Footer
```

---

## Backwards Compatibility Note

Old reports saved in AsyncStorage will NOT have
the new fields (crossDocumentCheck, agentVerification,
programmeAnalysis, bangladeshSpecificRisks).

In ReportScreen.tsx and pdfService.ts, always use
optional chaining when accessing new fields:

```typescript
report.crossDocumentCheck?.verdict ?? "N/A"
report.agentVerification?.agentFound ?? false
report.programmeAnalysis?.verdict ?? "N/A"
```

This prevents crashes when viewing old reports.
