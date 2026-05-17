# Product Requirements Document

## User Flow
1. App open → Home screen
2. Upload documents (JPG/PNG/PDF, max 10MB total)
3. Language select (বাংলা / English)
4. "Analyze" button click
5. bKash payment screen (৳99)
6. Payment success → AI analysis শুরু
7. Loading screen (progress দেখাবে)
8. Report screen (full report)
9. Download PDF option
10. Report automatically sidebar এ save হয়

## Screens
- HomeScreen: upload, language select, analyze button
- PaymentScreen: bKash payment flow
- LoadingScreen: analysis progress
- ReportScreen: full report + download
- HistoryScreen: sidebar এ পুরনো reports

## Pricing
- Single report: ৳99
- Bundle নেই (MVP তে)

## File Limits
- Max per file: 5MB
- Max total: 15MB
- Formats: JPG, PNG, PDF

## Report Sections (বিস্তারিত REPORT_STRUCTURE.md এ)
1. Risk Score (Safe/Suspicious/High Risk/Scam)
2. University Verification
3. Offer Letter Analysis  
4. Invoice Analysis
5. Red Flags
6. Recommended Actions

## What's NOT in MVP
- No user account
- No server/backend
- No bundle pricing
- No community reporting