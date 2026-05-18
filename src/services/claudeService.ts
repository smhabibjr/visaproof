import { File } from 'expo-file-system';

import type { AnalysisReport, AnalyzeParams, ServiceResult } from '@/types';

// ---------------------------------------------------------------------------
// API constants
// ---------------------------------------------------------------------------
const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

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
  'You are a document fraud detection expert for Bangladeshi students. ' +
  'Always respond with valid JSON only. No markdown, no explanation, no code blocks.';

// ---------------------------------------------------------------------------
// JSON template appended to every user prompt
// ---------------------------------------------------------------------------
const JSON_STRUCTURE = `{
  "riskScore": "SAFE" | "SUSPICIOUS" | "HIGH_RISK" | "SCAM",
  "riskPercentage": 0-100,
  "summary": "brief summary in selected language",
  "universityVerification": {
    "name": "",
    "country": "",
    "foundedYear": "",
    "isAccredited": true/false/null,
    "accreditationBody": "",
    "registrationNumber": "",
    "officialWebsite": "",
    "websiteMatch": true/false,
    "ugcRecognized": true/false/null,
    "worldRanking": "",
    "verdict": ""
  },
  "offerLetterAnalysis": {
    "hasOfficialLetterhead": true/false,
    "emailDomainLegitimate": true/false,
    "detectedEmail": "",
    "hasDigitalSignature": true/false,
    "grammarQuality": "GOOD"|"POOR"|"VERY_POOR",
    "suspiciousElements": [],
    "verdict": ""
  },
  "invoiceAnalysis": {
    "found": true/false,
    "paymentDestination": "",
    "isPersonalAccount": true/false,
    "amountReasonable": true/false,
    "currency": "",
    "paymentMethod": "",
    "suspiciousElements": [],
    "verdict": ""
  },
  "redFlags": [],
  "positivePoints": [],
  "recommendedActions": [],
  "disclaimer": ""
}`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------
function buildPrompt(language: string): string {
  const base =
    language === 'bn'
      ? 'এই ডকুমেন্টগুলো বিশ্লেষণ করো। বাংলাদেশি শিক্ষার্থীদের জন্য এটি স্ক্যাম কিনা যাচাই করো। শুধু JSON রিটার্ন করো, অন্য কিছু না।'
      : 'Analyze these documents. Check if this is a scam targeting Bangladeshi students. Return ONLY JSON, nothing else.';
  return `${base}\n\n${JSON_STRUCTURE}`;
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

  // STEP C — Call API
  console.log('=== STEP C: Calling API ===');
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
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
    console.error('Fetch error:', err);
    return { success: false, error: 'NETWORK_ERROR' };
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

  // STEP E — Parse response
  const rawText = data.content[0].text;

  console.log('=== RAW API RESPONSE ===');
  console.log(rawText);

  const cleaned = rawText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('JSON.parse failed:', err);
    console.error('Cleaned text was:', cleaned);
    return { success: false, error: 'PARSE_ERROR' };
  }

  if (!isValidAnalysisReport(parsed)) {
    console.error('Response failed structure validation:', parsed);
    return { success: false, error: 'PARSE_ERROR' };
  }

  console.log('=== STEP E: Parsed successfully ===');
  return { success: true, data: parsed };
}
