# VisaProof — Claude Code Instructions

## Project
বাংলাদেশি students দের জন্য university offer letter
ও invoice scam যাচাই করার React Native app।

## Tech Stack
- React Native (Expo) + TypeScript strict
- AsyncStorage (no backend, no login)
- Anthropic Claude API (claude-sonnet-4-5)
- aamarPay payment gateway
- expo-document-picker, expo-file-system
- react-native-html-to-pdf, expo-sharing
- @expo/vector-icons (Ionicons)

## Core Rules
1. No login, no backend — সব local
2. Payment before analysis (Feature 5 pending — skip now)
3. TypeScript strict — no `any`
4. All strings → /src/constants/strings.ts
5. All colors → /src/constants/colors.ts
6. Error handling everywhere
7. Optional chaining for new report fields
   (old AsyncStorage reports may lack new fields)

## Folder Structure
```
/src
  /components   → UploadArea, Sidebar, ReportCard,
                  InfoRow, Logo, Wordmark
  /screens      → HomeScreen, LoadingScreen,
                  ReportScreen, PaymentScreen
  /services     → claudeService, pdfService,
                  pdfTemplate, paymentService
  /storage      → reportStorage
  /types        → index.ts (all interfaces)
  /constants    → colors.ts, strings.ts, config.ts
  /hooks        → useFileUpload, useAnalysis, useReports
  /utils        → fileValidator
```

## Key Config
- Claude model: `claude-sonnet-4-5`
- Claude max_tokens: `8000`
- Claude timeout: `120s`
- API key: `process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY`
- Payment amount: `99 BDT` via aamarPay
- Max file size: `5MB image / 10MB PDF / 15MB total`
- Max stored reports: `50`

```

## Reference Files
- AI_PROMPT.md → Claude API system prompt + user prompt
- REPORT_STRUCTURE.md → full JSON structure + TypeScript types
- PAYMENT.md → aamarPay integration details
- STORAGE.md → AsyncStorage schema
