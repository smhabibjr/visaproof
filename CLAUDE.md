# VisaProof — Claude Code Instructions

## Project Overview
বাংলাদেশি স্টুডেন্টদের জন্য University offer letter ও 
invoice স্ক্যাম যাচাই করার React Native app।

## Tech Stack
- React Native (Expo)
- TypeScript
- AsyncStorage (local storage, no backend)
- Anthropic Claude API (document analysis)
- bKash Payment Gateway
- expo-document-picker
- expo-file-system
- react-native-pdf (PDF preview)

## Core Rules (সবসময় মানতে হবে)
1. No login, no backend — সব local এ থাকবে
2. প্রতিটা analysis এর আগে bKash payment verify করতে হবে
3. Report AsyncStorage এ save হবে (key: reports_list)
4. TypeScript strict mode — any type ব্যবহার করবে না
5. প্রতিটা component আলাদা ফাইলে থাকবে
6. Error handling সব জায়গায় থাকতে হবে

## Folder Structure
/src
  /components    → reusable UI components
  /screens       → main screens
  /services      → API calls (Claude, bKash)
  /storage       → AsyncStorage helpers
  /types         → TypeScript interfaces
  /constants     → colors, sizes, strings
  /hooks         → custom hooks
  /utils         → helper functions

## Coding Style
- Functional components only
- Custom hooks দিয়ে logic আলাদা রাখো
- Constants file থেকে colors/strings নাও
- Bengali comments লেখো গুরুত্বপূর্ণ জায়গায়