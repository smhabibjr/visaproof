import { Image } from 'react-native';

import type { ValidationResult } from '@/types';

const MIN_IMAGE_BYTES = 10 * 1024;        // 10 KB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB
const MIN_PDF_BYTES   = 1024;             // 1 KB
const MAX_PDF_BYTES   = 10 * 1024 * 1024; // 10 MB

function pass(): ValidationResult {
  return { isReadable: true, reason: 'ok', reasonBn: '', reasonEn: '', checkedAt: new Date().toISOString() };
}

function fail(reason: string, reasonBn: string, reasonEn: string): ValidationResult {
  return { isReadable: false, reason, reasonBn, reasonEn, checkedAt: new Date().toISOString() };
}

function extFromName(name: string): string {
  return (name.split('.').pop() ?? '').toLowerCase();
}

// ---------------------------------------------------------------------------
// Image validation — 3 checks only
// ---------------------------------------------------------------------------
export async function validateImage(
  uri: string,
  fileSize: number,
  name: string,
): Promise<ValidationResult> {
  // Check 1: Image loads and has width > 0
  try {
    const width = await new Promise<number>((resolve, reject) => {
      Image.getSize(uri, (w) => resolve(w), reject);
    });
    if (width <= 0) {
      return fail('not_loadable',
        'ছবিটি লোড হচ্ছে না — অন্য ছবি চেষ্টা করুন',
        'Image could not load — try a different image',
      );
    }
  } catch {
    return fail('not_loadable',
      'ছবিটি লোড হচ্ছে না — অন্য ছবি চেষ্টা করুন',
      'Image could not load — try a different image',
    );
  }

  // Check 2: File size between 10 KB and 5 MB
  if (fileSize < MIN_IMAGE_BYTES) {
    return fail('too_small', 'ছবিটি অনেক ছোট', 'Image is too small');
  }
  if (fileSize > MAX_IMAGE_BYTES) {
    return fail('too_large', 'ফাইল সাইজ ৫MB এর বেশি', 'File size exceeds 5 MB');
  }

  // Check 3: Extension from original filename must be jpg, jpeg, or png
  const ext = extFromName(name);
  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    return fail('bad_extension', 'শুধু JPG বা PNG ফাইল দিন', 'Only JPG or PNG files are allowed');
  }

  return pass();
}

// ---------------------------------------------------------------------------
// PDF validation — 3 checks only
// ---------------------------------------------------------------------------
export async function validatePDF(
  _uri: string,
  fileSize: number,
  name: string,
): Promise<ValidationResult> {
  // Check 1: File size between 1 KB and 10 MB
  if (fileSize < MIN_PDF_BYTES) {
    return fail('pdf_empty', 'ফাইলটি খালি', 'File is empty');
  }
  if (fileSize > MAX_PDF_BYTES) {
    return fail('pdf_too_large', 'ফাইল সাইজ ১০MB এর বেশি', 'File size exceeds 10 MB');
  }

  // Check 2: Extension from original filename must be .pdf
  const ext = extFromName(name);
  if (ext !== 'pdf') {
    return fail('bad_extension', 'শুধু PDF ফাইল দিন', 'Only PDF files are allowed');
  }

  return pass();
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export async function validateFile(file: {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}): Promise<ValidationResult> {
  if (file.mimeType === 'application/pdf') {
    return validatePDF(file.uri, file.size, file.name);
  }
  return validateImage(file.uri, file.size, file.name);
}
