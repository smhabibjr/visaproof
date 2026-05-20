import { File } from 'expo-file-system';

import type { AnalysisReport, AnalyzeParams, ServiceResult } from '@/types';

// ---------------------------------------------------------------------------
// API constants
// ---------------------------------------------------------------------------
const API_URL  = 'https://api.anthropic.com/v1/messages';
const MODEL    = 'claude-sonnet-4-5';
const MAX_TOKENS = 16000;
const TIMEOUT_MS = 240000;

// ---------------------------------------------------------------------------
// Typed content block union — no "any"
// ---------------------------------------------------------------------------
type ImageMediaType    = 'image/jpeg' | 'image/png';
type DocumentMediaType = 'application/pdf';

interface ImageBlock {
  type: 'image';
  source: { type: 'base64'; media_type: ImageMediaType; data: string };
}
interface DocumentBlock {
  type: 'document';
  source: { type: 'base64'; media_type: DocumentMediaType; data: string };
}
interface TextBlock {
  type: 'text';
  text: string;
}
type ContentBlock = ImageBlock | DocumentBlock | TextBlock;

// ---------------------------------------------------------------------------
// API response shape — both success and error variants
// ---------------------------------------------------------------------------
interface ApiResponse {
  content?: Array<{ type: string; text: string }>;
  error?: { type: string; message: string };
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT =
  'CRITICAL: Output pure JSON only. No markdown. No code fences. No backticks. ' +
  'Start your response with { and end with }. Nothing before or after the JSON.\n\n' +
  'You are an expert document fraud detection AI specialized in ' +
  'university admission scams targeting Bangladeshi students.\n\n' +
  'You have deep knowledge of:\n' +
  '- International university accreditation systems worldwide\n' +
  '- Global banking and payment fraud patterns\n' +
  '- Document authentication and forgery detection\n' +
  '- Common scam tactics used against South Asian students\n' +
  '- Country-specific higher education regulatory bodies\n\n' +
  'RULES:\n' +
  '1. Analyze ALL provided documents TOGETHER as a complete set\n' +
  '2. Cross-verify information across documents before concluding\n' +
  '3. A detail that looks fine alone may contradict another doc\n' +
  '4. Such contradictions are your most important red flags\n' +
  '5. Return ONLY valid JSON — no markdown, no explanation, ' +
  'no code blocks, no preamble, no postamble\n' +
  '6. Never leave a required field empty — use null if unknown\n' +
  '7. Be specific in verdicts — vague answers are useless\n' +
  '8. Output language must match the user\'s selected language';

// ---------------------------------------------------------------------------
// Complete JSON structure template
// ---------------------------------------------------------------------------
const JSON_STRUCTURE = `{
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
    "registrationNumber": "Registration or accreditation number or null",
    "officialWebsite": "www.example.edu or null",
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
      { "label": "Verify on TEQSA", "url": "https://www.teqsa.gov.au/national-register" }
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
    "suspiciousElements": [],
    "positiveElements": [],
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
    "suspiciousElements": [],
    "positiveElements": [],
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
    "qualificationFrameworkLevel": "Level number e.g. MQF 6, AQF 5 or null",
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
    "IMPORTANT: Each item here must be a plain string — NOT an object. Example: 'Payment going to personal account'",
    "Another plain string red flag"
  ],
  "positivePoints": [
    "IMPORTANT: Each item must be a plain string. Example: 'Named signatory with verifiable title'"
  ],
  "recommendedActions": [
    "IMPORTANT: Each item must be a plain string. Example: 'Contact the institution directly on their official website to verify this offer'"
  ],

  "officialVerificationLinks": [
    { "label": "Check CRICOS registration (Australia)", "url": "https://cricos.education.gov.au" }
  ],

  "disclaimer": "This report was generated using AI analysis and may occasionally be incorrect. Always verify through official channels before making any financial commitment."
}`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
function buildPrompt(language: string): string {
  const langInstruction =
    language === 'bn'
      ? 'এই সকল ডকুমেন্ট একসাথে বিশ্লেষণ করো।\nসকল verdict, summary, flags, এবং recommendations বাংলায় লিখবে। Technical terms (IBAN, CRICOS, RNCP etc.) ইংরেজিতে রাখবে কিন্তু ব্যাখ্যা বাংলায় দেবে।\nশুধু JSON রিটার্ন করো।'
      : 'Analyze ALL these documents together.\nAll verdict, summary, flags, and recommendations must be in English. Return ONLY JSON.';

  const outputLang = language === 'bn' ? 'Bengali' : 'English';

  return `${langInstruction}

I need to know if this is a scam targeting a Bangladeshi student.

Follow these steps in order:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — CROSS DOCUMENT VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compare across ALL provided documents:
- Institution/university name: identical in all docs?
- Student full name: consistent?
- Date of birth: consistent?
- Passport number: consistent?
- Bank account numbers: same in all docs?
  → DIFFERENT ACCOUNT NUMBERS = CRITICAL RED FLAG
- Date sequence logical? (offer → invoice → deadline)
- Currency consistent throughout?
- Programme name exactly matching across all docs?

Flag ANY inconsistency as a critical red flag.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — INSTITUTION VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identify institution country, then check against
the CORRECT national accreditor for that country:

  Australia  → TEQSA (teqsa.gov.au) + CRICOS code
  UK         → QAA (qaa.ac.uk) + OfS registration
  France     → RNCP number + Ministère de l'Éducation
  Malta      → MFHEA + MQF level
  Austria    → AQ Austria + Bundesministerium
  Canada     → Provincial designation body
  USA        → Regional accreditor (HLC/SACSCOC/etc)
  Germany    → ACQUIN/ZEvA + state ministry (KMK)
  Ireland    → QQI (qqi.ie)
  Malaysia   → MQA (mqa.gov.my)
  Other      → research the equivalent national body

CRITICAL: NEVER check UGC for foreign institutions.
UGC (Bangladesh) only applies to institutions
physically operating inside Bangladesh.
If a foreign institution CLAIMS UGC recognition → RED FLAG.

Also check:
- Is this a full university or a VET/training provider?
- Is the programme offered accredited specifically?
- Is the tuition fee reasonable for this country/level?
- Does institution appear in official databases?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — PAYMENT PATTERN ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract ALL payment details. Check:

CRITICAL RED FLAGS in payment:
→ Payment to personal bank account (biggest red flag)
→ Different bank accounts in different documents
→ Fintech/online-only bank for institutional payment:
   Revolut, Wise, N26, Monzo, Starling, Bunq = SUSPICIOUS
   (legitimate universities use established national banks)
→ IBAN country prefix ≠ institution country
   Example: FR76 prefix + Lithuanian bank = MISMATCH
→ Account holder name ≠ institution name
   Example: "LEARN KEY LIMITED" ≠ "Learnkey Institute"
→ Payment deadline ≤ 7 days = extreme pressure
→ Payment deadline ≤ 14 days = high pressure
→ Non-refundable fees > 5% of total = suspicious
→ Full upfront payment of entire course demanded
→ Payment to "LIMITED" company not institution
→ No clear invoice number or reference

POSITIVE payment indicators:
→ Major established national bank (NAB, HSBC, Erste, BNP)
→ Account holder name exactly matches institution
→ Installment payment schedule provided
→ Clear invoice with unique reference number
→ Flywire/Convera used (legitimate platforms)
→ Reasonable refund policy stated
→ VAT/tax number on invoice

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — DOCUMENT AUTHENTICITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each document check:

POSITIVE authenticity signals:
→ Named signatory: full name + title visible
→ Handwritten signature or verified digital signature
→ Official institutional seal or stamp
→ Unique reference/application number
→ Official email domain (.edu, .ac.xx, institutional TLD)
   NOT gmail/yahoo/hotmail/outlook personal domains
→ Page numbering (Page X of Y) on multi-page docs
→ Verification link or QR code present
→ Terms and conditions included
→ Full physical address matching institution
→ Student name used in greeting (not "Dear Sir/Madam")

RED FLAGS in documents:
→ Generic signatory ("Team", "Department", "Office Only")
→ Personal email for official contact
→ "Dear Sir/Madam" when offer should address student by name
→ No reference number anywhere in document
→ No physical address or unverifiable address
→ Excessive urgency language throughout
→ Spelling or grammar errors in official names
→ Inconsistent fonts/formatting within same document
→ Document dated far in the future (template indicator)
→ Missing standard sections for that document type
→ Scholarship offer valid only if paid extremely quickly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — AGENT VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If any agent or consultancy is mentioned:
- Extract agent company name
- Check if MARA registered (Australia: mara.gov.au)
- Check if ICEF certified (international standard)
- Check if BMET registered (Bangladesh standard)
- Flag if agent registration not mentioned
- Flag if agent pressure tactics evident:
  → Urgent deadlines set by agent not institution
  → "Limited seats" or "exclusive offer" language
  → Separate processing fees not in official docs
  → "Guaranteed visa" language anywhere
  → Agent advising to ignore official channels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — PROGRAMME LEGITIMACY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check programme type and relevance:

- "Top-up degree" = NOT a full degree
  Only 1 year, requires prior qualification,
  Recognition in Bangladesh uncertain — WARN STUDENT

- VET Certificate/Diploma ≠ University Degree
  These are vocational training qualifications.
  Many Bangladeshi students misunderstand this.
  Certificate III/IV in Australia = trade qualification
  NOT equivalent to university degree — WARN STUDENT

- "Foundation Programme" before main degree:
  Is this legitimate pathway or unnecessary cash grab?
  Check if institution's own foundation or third party.

- PR Pathway Pattern (Australia specifically):
  Hospitality/Cookery → Certificate III → Diploma pathway
  is heavily marketed to Bangladeshi students as
  permanent residency pathway. Flag this if present.

- Fee reasonableness:
  Australia VET: AUD 8,000-20,000/year typical
  UK Bachelor: GBP 10,000-25,000/year typical
  France private Bachelor: EUR 5,000-15,000/year
  Malta Bachelor: EUR 5,000-12,000/year typical
  Austria private university: EUR 7,000-14,000/year
  Flag if significantly below or above these ranges.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — BANGLADESH SPECIFIC RISKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Check these patterns specific to BD student scams:
- Institution unknown with suspiciously good scholarship
- Agent charging fees not in official institution docs
- "Guaranteed visa" language anywhere in any document
- Institution not findable via independent web search
- Website domain registered recently (< 2 years)
- Social media presence but no academic reputation
- Multiple countries/campuses mentioned vaguely
- Document resembles official format but key details off
- Contact person unreachable except through agent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK SCORE CALCULATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use these STRICT thresholds:

SCAM (85-100%): ANY of these present:
  → Different bank accounts across documents
  → Payment to verified personal account
  → Institution name not findable anywhere
  → "Guaranteed visa" language
  → IBAN completely mismatched with institution

HIGH_RISK (60-84%): ANY of these:
  → Fintech bank for institutional payment
  → IBAN country mismatch
  → Account holder name mismatch
  → No named signatory
  → Payment deadline < 7 days
  → Non-refundable fees > 10%
  → VET presented as university degree
  → Agent with no verifiable registration

SUSPICIOUS (35-59%): MULTIPLE of these:
  → Unknown institution in accreditation database
  → Short payment deadline (7-14 days)
  → Excessive urgency language
  → Missing standard document elements
  → Conditional offer with vague conditions
  → Scholarship only if paid immediately

SAFE (0-34%): ALL of these:
  → Cross-document checks all pass
  → Major bank, account name matches
  → Named signatory verifiable
  → Known accredited institution
  → Reasonable fees and payment timeline
  → Standard document format and content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY this JSON structure.
All text values must be in ${outputLang}.
Null for genuinely unknown values only.

${JSON_STRUCTURE}`;
}

// ---------------------------------------------------------------------------
// Validation guard
// ---------------------------------------------------------------------------
function isValidAnalysisReport(obj: unknown): obj is AnalysisReport {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  const validRiskScores = ['SAFE', 'SUSPICIOUS', 'HIGH_RISK', 'SCAM'];
  return (
    validRiskScores.includes(r.riskScore as string) &&
    typeof r.riskPercentage === 'number' &&
    typeof r.summary === 'string' &&
    typeof r.universityVerification === 'object' &&
    typeof r.offerLetterAnalysis === 'object' &&
    typeof r.invoiceAnalysis === 'object' &&
    Array.isArray(r.redFlags) &&
    Array.isArray(r.recommendedActions)
  );
}

// ---------------------------------------------------------------------------
// String array normalization — Claude sometimes returns objects instead of strings
// ---------------------------------------------------------------------------
function normalizeStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const o = item as Record<string, unknown>;
      // Extract the most descriptive string field available
      const candidate =
        o.description ?? o.text ?? o.message ?? o.flag ??
        o.recommendation ?? o.issue ?? o.detail ?? o.content;
      if (typeof candidate === 'string') return candidate;
      return JSON.stringify(item);
    }
    return String(item);
  });
}

function normalizeReport(report: AnalysisReport): AnalysisReport {
  report.redFlags            = normalizeStringArray(report.redFlags);
  report.positivePoints      = normalizeStringArray(report.positivePoints);
  report.recommendedActions  = normalizeStringArray(report.recommendedActions);

  if (report.offerLetterAnalysis) {
    report.offerLetterAnalysis.suspiciousElements =
      normalizeStringArray(report.offerLetterAnalysis.suspiciousElements);
    report.offerLetterAnalysis.positiveElements =
      normalizeStringArray(report.offerLetterAnalysis.positiveElements);
  }
  if (report.invoiceAnalysis) {
    report.invoiceAnalysis.suspiciousElements =
      normalizeStringArray(report.invoiceAnalysis.suspiciousElements);
    report.invoiceAnalysis.positiveElements =
      normalizeStringArray(report.invoiceAnalysis.positiveElements);
  }
  if (report.crossDocumentCheck) {
    report.crossDocumentCheck.inconsistencies =
      normalizeStringArray(report.crossDocumentCheck.inconsistencies);
  }
  return report;
}

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------
export type AnalysisErrorCode =
  | 'NETWORK_ERROR'
  | 'API_KEY_ERROR'
  | 'FILE_TOO_LARGE'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'UNKNOWN_ERROR';

// ---------------------------------------------------------------------------
// Main service function
// ---------------------------------------------------------------------------
export async function analyzeDocuments(
  params: AnalyzeParams
): Promise<ServiceResult<AnalysisReport>> {
  const { files, language } = params;
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  // STEP A — Read each file as base64
  console.log('=== STEP A: Reading files ===');
  const contentArray: ContentBlock[] = [];

  for (const file of files) {
    let base64: string;
    try {
      base64 = await new File(file.uri).base64();
    } catch (err) {
      console.error('File read error:', err);
      return { success: false, error: 'NETWORK_ERROR' };
    }

    if (file.mimeType === 'application/pdf') {
      contentArray.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      });
    } else {
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: file.mimeType as ImageMediaType,
          data: base64,
        },
      });
    }
  }

  // STEP B — Add text prompt block
  contentArray.push({ type: 'text', text: buildPrompt(language) });
  console.log(`=== STEP B: Content array built, count: ${contentArray.length} ===`);

  // STEP C — Call API with timeout
  console.log('=== STEP C: Calling API ===');
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key': apiKey ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: contentArray,
          },
        ],
      }),
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('Request timed out after', TIMEOUT_MS, 'ms');
      return { success: false, error: 'TIMEOUT' };
    }
    console.error('Fetch error:', err);
    return { success: false, error: 'NETWORK_ERROR' };
  } finally {
    clearTimeout(timeoutId);
  }

  // STEP D — Response received
  console.log('=== STEP D: Response received ===');
  console.log('HTTP status:', response.status);

  if (response.status === 401 || response.status === 403) {
    return { success: false, error: 'API_KEY_ERROR' };
  }
  if (response.status === 413) {
    return { success: false, error: 'FILE_TOO_LARGE' };
  }

  let data: ApiResponse;
  try {
    data = await response.json() as ApiResponse;
  } catch (err) {
    console.error('JSON parse error on response body:', err);
    return { success: false, error: 'PARSE_ERROR' };
  }

  if (data.error) {
    console.error('API Error:', data.error);
    return { success: false, error: 'UNKNOWN_ERROR' };
  }

  if (!data.content || data.content.length === 0) {
    console.error('Empty content in API response');
    return { success: false, error: 'PARSE_ERROR' };
  }

  // STEP E — Parse response (3-attempt fallback)
  const rawText = data.content[0].text;

  console.log('=== RAW API RESPONSE ===');
  console.log(rawText);

  const cleaned = rawText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  let parsed: unknown;

  // Attempt 1: direct parse of cleaned text
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Attempt 2: extract JSON object from anywhere in the response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (err2) {
        console.error('Attempt 2 parse failed:', err2);
      }
    }

    // Attempt 3: give up with diagnostics
    if (parsed === undefined) {
      console.error('PARSE FAILED. Raw text (first 500 chars):', rawText.slice(0, 500));
      return { success: false, error: 'PARSE_ERROR' };
    }
  }

  if (!isValidAnalysisReport(parsed)) {
    console.error('Response failed structure validation:', parsed);
    return { success: false, error: 'PARSE_ERROR' };
  }

  normalizeReport(parsed);

  console.log('=== STEP E: Parsed successfully ===');
  return { success: true, data: parsed };
}
