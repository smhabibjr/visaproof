import type { Language } from '@/types';

type StringMap = Record<Language, string>;

function s(bn: string, en: string): StringMap {
  return { bn, en };
}

// ---------------------------------------------------------------------------
// App-wide
// ---------------------------------------------------------------------------
export const AppStrings = {
  appName: s('Visa Proof', 'Visa Proof'),
  tagline: s(
    'স্ক্যাম থেকে নিরাপদ থাকুন',
    'Stay safe from scams'
  ),
  loading: s('লোড হচ্ছে...', 'Loading...'),
  error: s('কিছু একটা ভুল হয়েছে', 'Something went wrong'),
  retry: s('আবার চেষ্টা করুন', 'Retry'),
  cancel: s('বাতিল', 'Cancel'),
  confirm: s('নিশ্চিত করুন', 'Confirm'),
  ok: s('ঠিক আছে', 'OK'),
  back: s('পেছনে', 'Back'),
  close: s('বন্ধ করুন', 'Close'),
  save: s('সংরক্ষণ', 'Save'),
  download: s('ডাউনলোড', 'Download'),
  share: s('শেয়ার', 'Share'),
} as const;

// ---------------------------------------------------------------------------
// Language selector
// ---------------------------------------------------------------------------
export const LanguageStrings = {
  selectLanguage: s('ভাষা নির্বাচন করুন', 'Select Language'),
  bengali: s('বাংলা', 'Bengali'),
  english: s('ইংরেজি', 'English'),
} as const;

// ---------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------
export const HomeStrings = {
  title: s('ডকুমেন্ট যাচাই করুন', 'Verify Your Documents'),
  subtitle: s(
    'University offer letter ও invoice আপলোড করুন',
    'Upload your university offer letter and invoice'
  ),
  uploadButton: s('ডকুমেন্ট আপলোড করুন', 'Upload Documents'),
  uploadHint: s(
    'JPG, PNG বা PDF (সর্বোচ্চ ৫MB প্রতিটি)',
    'JPG, PNG or PDF (max 5MB each)'
  ),
  analyzeButton: s('বিশ্লেষণ করুন — ৳৯৯', 'Analyze — ৳99'),
  addMoreFiles: s('আরও ফাইল যোগ করুন', 'Add more files'),
  removeFile: s('সরিয়ে দিন', 'Remove'),
  filesSelected: s('টি ফাইল নির্বাচিত', 'file(s) selected'),
  totalSize: s('মোট সাইজ', 'Total size'),
  languageLabel: s('রিপোর্টের ভাষা', 'Report language'),

  uploadSheetTitle: s('কোথা থেকে নেবেন?', 'Choose source'),
  camera: s('ক্যামেরা', 'Camera'),
  gallery: s('গ্যালারি', 'Gallery'),
  files: s('ফাইল', 'Files'),

  // Validation errors
  fileTooLarge: s('ফাইলটি ৫MB এর বেশি', 'File exceeds 5MB limit'),
  totalTooLarge: s('মোট সাইজ ১৫MB এর বেশি হওয়া যাবে না', 'Total size must not exceed 15MB'),
  unsupportedFormat: s(
    'শুধু JPG, PNG বা PDF ফাইল সমর্থিত',
    'Only JPG, PNG or PDF files are supported'
  ),
  noFilesSelected: s('কমপক্ষে একটি ফাইল আপলোড করুন', 'Please upload at least one file'),
} as const;

// ---------------------------------------------------------------------------
// Payment screen
// ---------------------------------------------------------------------------
export const PaymentStrings = {
  title: s('পেমেন্ট করুন', 'Make Payment'),
  subtitle: s('bKash দিয়ে পেমেন্ট করুন', 'Pay with bKash'),
  amount: s('৳৯৯', '৳99'),
  amountLabel: s('বিশ্লেষণ মূল্য', 'Analysis fee'),
  bkashNumberLabel: s('bKash নম্বর', 'bKash number'),
  bkashNumberPlaceholder: s('01XXXXXXXXX', '01XXXXXXXXX'),
  transactionIdLabel: s('ট্রানজেকশন ID', 'Transaction ID'),
  transactionIdPlaceholder: s('উদাহরণ: 8N6XXXXXXXX', 'e.g. 8N6XXXXXXXX'),
  verifyButton: s('পেমেন্ট যাচাই করুন', 'Verify Payment'),
  instruction: s(
    'VisaProof এর bKash নম্বরে ৳৯৯ পাঠান, তারপর ট্রানজেকশন ID দিন',
    'Send ৳99 to VisaProof bKash number, then enter your Transaction ID'
  ),
  merchantNumber: s('bKash: 01XXXXXXXXXX', 'bKash: 01XXXXXXXXXX'),
  verifying: s('যাচাই হচ্ছে...', 'Verifying...'),
  invalidTransaction: s(
    'ট্রানজেকশন ID সঠিক নয়',
    'Invalid Transaction ID'
  ),
  paymentSuccess: s('পেমেন্ট সফল হয়েছে!', 'Payment successful!'),
} as const;

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------
export const LoadingStrings = {
  title: s('বিশ্লেষণ চলছে...', 'Analyzing...'),
  steps: {
    readingDocuments: s('ডকুমেন্ট পড়া হচ্ছে', 'Reading documents'),
    verifyingUniversity: s('বিশ্ববিদ্যালয় যাচাই হচ্ছে', 'Verifying university'),
    checkingOfferLetter: s('অফার লেটার পরীক্ষা হচ্ছে', 'Checking offer letter'),
    checkingInvoice: s('ইনভয়েস পরীক্ষা হচ্ছে', 'Checking invoice'),
    generatingReport: s('রিপোর্ট তৈরি হচ্ছে', 'Generating report'),
  },
  pleaseWait: s(
    'অনুগ্রহ করে অপেক্ষা করুন, এটি ৩০-৬০ সেকেন্ড নিতে পারে',
    'Please wait, this may take 30-60 seconds'
  ),
} as const;

// ---------------------------------------------------------------------------
// Report screen
// ---------------------------------------------------------------------------
export const ReportStrings = {
  title: s('বিশ্লেষণ রিপোর্ট', 'Analysis Report'),
  riskScore: s('ঝুঁকির মাত্রা', 'Risk Score'),
  riskLabels: {
    SAFE: s('নিরাপদ', 'Safe'),
    SUSPICIOUS: s('সন্দেহজনক', 'Suspicious'),
    HIGH_RISK: s('উচ্চ ঝুঁকি', 'High Risk'),
    SCAM: s('স্ক্যাম', 'Scam'),
  },
  summary: s('সারসংক্ষেপ', 'Summary'),
  universityVerification: s('বিশ্ববিদ্যালয় যাচাই', 'University Verification'),
  offerLetterAnalysis: s('অফার লেটার বিশ্লেষণ', 'Offer Letter Analysis'),
  invoiceAnalysis: s('ইনভয়েস বিশ্লেষণ', 'Invoice Analysis'),
  redFlags: s('সতর্কতা চিহ্ন', 'Red Flags'),
  positivePoints: s('ইতিবাচক দিক', 'Positive Points'),
  recommendedActions: s('পরামর্শ', 'Recommended Actions'),
  disclaimer: s('দায়মুক্তি', 'Disclaimer'),
  downloadPDF:    s('PDF ডাউনলোড করুন', 'Download PDF'),
  shareReport:    s('রিপোর্ট শেয়ার করুন', 'Share Report'),
  generatingPDF:  s('PDF তৈরি হচ্ছে...', 'Generating PDF...'),
  pdfError:       s('PDF তৈরি করা যায়নি', 'Could not generate PDF'),

  // Boolean labels
  yes: s('হ্যাঁ', 'Yes'),
  no: s('না', 'No'),
  unknown: s('অজানা', 'Unknown'),
  found: s('পাওয়া গেছে', 'Found'),
  notFound: s('পাওয়া যায়নি', 'Not found'),

  // Grammar quality
  grammarGood: s('ভালো', 'Good'),
  grammarPoor: s('দুর্বল', 'Poor'),
  grammarVeryPoor: s('খুব দুর্বল', 'Very Poor'),
} as const;

// ---------------------------------------------------------------------------
// History screen
// ---------------------------------------------------------------------------
export const HistoryStrings = {
  title: s('পুরনো রিপোর্ট', 'Report History'),
  empty: s('কোনো রিপোর্ট নেই', 'No reports yet'),
  emptyHint: s(
    'আপনার প্রথম ডকুমেন্ট বিশ্লেষণ করুন',
    'Analyze your first document'
  ),
  deleteReport: s('মুছে দিন', 'Delete'),
  deleteConfirmTitle: s('রিপোর্ট মুছবেন?', 'Delete report?'),
  deleteConfirmMessage: s(
    'এই রিপোর্টটি স্থায়ীভাবে মুছে যাবে।',
    'This report will be permanently deleted.'
  ),
  storageWarning: s(
    'সব ডেটা এই ডিভাইসে সংরক্ষিত। অ্যাপ আনইনস্টল করলে সব রিপোর্ট মুছে যাবে।',
    'All data is stored on this device only. Uninstalling the app will delete all reports.'
  ),
  maxReportsWarning: s(
    'সর্বোচ্চ ৫০টি রিপোর্ট সংরক্ষণ করা যাবে। পুরনো রিপোর্ট স্বয়ংক্রিয়ভাবে মুছে যাবে।',
    'Maximum 50 reports can be stored. Oldest reports are deleted automatically.'
  ),
} as const;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
export const ValidationStrings = {
  // Per-file status badges
  checking:   s('যাচাই হচ্ছে...', 'Checking...'),
  good:       s('পরিষ্কার', 'Clear'),
  acceptable: s('গ্রহণযোগ্য', 'Acceptable'),
  poor:       s('গ্রহণযোগ্য নয়', 'Not acceptable'),

  // Block messages
  poorFileBlock: s(
    'কিছু ফাইলের মান ভালো না — সরিয়ে আবার চেষ্টা করুন',
    'Some files have poor quality — remove and retry'
  ),
  checkingBlock: s(
    'ফাইল যাচাই চলছে, একটু অপেক্ষা করুন',
    'Validation in progress, please wait'
  ),
  acceptableWarning: s(
    'মান কম — AI বিশ্লেষণ নির্ভুল নাও হতে পারে',
    'Low quality — AI analysis may be less accurate'
  ),
} as const;

// ---------------------------------------------------------------------------
// Analysis / Loading screen
// ---------------------------------------------------------------------------
export const AnalysisStrings = {
  statusPreparing:   s('ডকুমেন্ট প্রস্তুত করা হচ্ছে...', 'Preparing documents...'),
  statusAnalyzing:   s('AI বিশ্লেষণ চলছে...', 'AI analysis in progress...'),
  statusDone:        s('সম্পন্ন! রিপোর্ট তৈরি হয়েছে', 'Done! Report ready'),
  estimatedTime:     s('এটি ৩০-৬০ সেকেন্ড সময় নিতে পারে', 'This may take 30–60 seconds'),
  retryButton:       s('আবার চেষ্টা করুন', 'Try Again'),
  errorNetwork:      s('ইন্টারনেট সংযোগ পরীক্ষা করুন', 'Check your internet connection'),
  errorApiKey:       s('API সমস্যা হয়েছে, পরে চেষ্টা করুন', 'API error, please try later'),
  errorFileTooLarge: s('ফাইল অনেক বড়, ছোট ফাইল ব্যবহার করুন', 'File too large, use a smaller file'),
  errorParse:        s('রিপোর্ট তৈরিতে সমস্যা হয়েছে, আবার চেষ্টা করুন', 'Report generation failed, try again'),
  errorTimeout:      s('সময় শেষ হয়ে গেছে, আবার চেষ্টা করুন', 'Timed out, try again'),
  errorUnknown:      s('কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন', 'Something went wrong, try again'),
} as const;

// ---------------------------------------------------------------------------
// Helper to get string by language
// ---------------------------------------------------------------------------
export function t(map: StringMap, lang: Language): string {
  return map[lang];
}
