import * as FileSystem from 'expo-file-system';
import { GLView } from 'expo-gl';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

import type { QualityLabel, ValidationResult } from '@/types';

// ---------------------------------------------------------------------------
// Thresholds — এখানে টিউন করলে পুরো অ্যালগরিদম পরিবর্তন হয়
// ---------------------------------------------------------------------------
const BLUR_THRESHOLD = 200;   // Laplacian Variance — এর নিচে হলে ঝাপসা
const LV_GOOD        = 1000;  // এর উপরে হলে পরিষ্কার
const MIN_DIMENSION  = 300;   // ন্যূনতম width/height (px)
const DARK_THRESHOLD = 30;    // গড় brightness এর নিচে = অন্ধকার
const OVER_THRESHOLD = 245;   // গড় brightness এর উপরে = overexposed
const GOOD_BRIGHT_MIN = 50;
const GOOD_BRIGHT_MAX = 230;
const MIN_PDF_BYTES  = 2048;  // 2 KB — এর ছোট PDF reject

// ---------------------------------------------------------------------------
// expo-gl টাইপ extension — localUri support
// ---------------------------------------------------------------------------
interface GLWithLocalUri extends ExpoWebGLRenderingContext {
  texImage2D(
    target: number, level: number, internalformat: number,
    format: number, type: number,
    source: { localUri: string }
  ): void;
}

// ---------------------------------------------------------------------------
// Pixel extraction — expo-gl দিয়ে raw RGBA Uint8Array বের করা হয়
// ---------------------------------------------------------------------------
async function readPixelsRGBA(uri: string, size: number): Promise<Uint8Array> {
  const gl = (await GLView.createContextAsync()) as GLWithLocalUri;

  // Texture তৈরি এবং image load করা
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // expo-gl native extension: localUri থেকে texture load
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
    { localUri: uri }
  );

  // Non-power-of-2 texture এর জন্য প্রয়োজনীয় settings
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Texture upload সম্পন্ন হওয়ার জন্য flush করা হয়
  gl.flush();

  // Framebuffer তৈরি এবং texture attach
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0
  );

  gl.viewport(0, 0, size, size);

  // readPixels GPU sync force করে — RGBA format
  const pixels = new Uint8Array(size * size * 4);
  gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  gl.deleteTexture(texture);
  gl.deleteFramebuffer(fb);

  return pixels;
}

// ---------------------------------------------------------------------------
// Pure JS algorithms — pixel data থেকে quality metrics বের করা হয়
// ---------------------------------------------------------------------------

function toGrayscale(rgba: Uint8Array): number[] {
  const gray: number[] = new Array(rgba.length / 4);
  for (let i = 0; i < rgba.length; i += 4) {
    // ITU-R BT.601 luminance coefficients
    gray[i / 4] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return gray;
}

function avgBrightness(gray: number[]): number {
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  return sum / gray.length;
}

// Laplacian Variance — শুধু border বাদ দিয়ে ভেতরের pixels এ apply করা হয়
function laplacianVariance(gray: number[], size: number): number {
  const lapValues: number[] = [];

  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      const c = gray[row * size + col];
      const t = gray[(row - 1) * size + col];
      const b = gray[(row + 1) * size + col];
      const l = gray[row * size + (col - 1)];
      const r = gray[row * size + (col + 1)];
      lapValues.push(t + b + l + r - 4 * c);
    }
  }

  const mean = lapValues.reduce((s, v) => s + v, 0) / lapValues.length;
  const variance =
    lapValues.reduce((s, v) => s + (v - mean) ** 2, 0) / lapValues.length;

  return variance;
}

// ---------------------------------------------------------------------------
// Reason strings — reason key → Bengali/English messages
// ---------------------------------------------------------------------------
const REASON_MAP: Record<string, { key: string; bn: string; en: string }> = {
  too_small:   { key: 'too_small',   bn: 'ছবিটি অনেক ছোট — কাছ থেকে তুলুন',                      en: 'Image too small — retake closer' },
  dark:        { key: 'dark',        bn: 'ছবিটি অনেক অন্ধকার — আলোর কাছে তুলুন',                  en: 'Image too dark — move to better lighting' },
  overexposed: { key: 'overexposed', bn: 'ছবিটি অনেক উজ্জ্বল — সরাসরি আলো এড়িয়ে তুলুন',          en: 'Image overexposed — avoid direct light' },
  blur:        { key: 'blur',        bn: 'ছবিটি ঝাপসা — পরিষ্কার আলোতে আবার তুলুন',               en: 'Image too blurry — retake in better light' },
  pdf_small:   { key: 'pdf_small',   bn: 'PDF ফাইলটি অনেক ছোট',                                    en: 'PDF file is too small' },
  pdf_invalid: { key: 'pdf_invalid', bn: 'বৈধ PDF ফাইল নয়',                                        en: 'Not a valid PDF file' },
  pdf_empty:   { key: 'pdf_empty',   bn: 'PDF এ কোনো পড়ার মতো content নেই',                        en: 'PDF has no readable content' },
  ok:          { key: 'ok',          bn: '',                                                          en: '' },
};

function buildResult(
  isReadable: boolean,
  reasonKey: string,
  qualityScore: number,
  qualityLabel: QualityLabel,
): ValidationResult {
  const r = REASON_MAP[reasonKey] ?? REASON_MAP['ok'];
  return {
    isReadable,
    reason: r.key,
    reasonBn: r.bn,
    reasonEn: r.en,
    checkedAt: new Date().toISOString(),
    qualityScore,
    qualityLabel,
  };
}

// ---------------------------------------------------------------------------
// Image validation — 4-step pipeline
// ---------------------------------------------------------------------------
export async function validateImage(
  uri: string,
  fileSize: number,
): Promise<ValidationResult> {
  try {
    // Step 1: Resolution check
    const { width, height } = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        Image.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject);
      }
    );

    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      return buildResult(false, 'too_small', 20, 'POOR');
    }

    // Step 2: 100x100 grayscale pixel extraction
    const resized = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 100, height: 100 } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 1.0 }
    );

    const rgba = await readPixelsRGBA(resized.uri, 100);
    const gray = toGrayscale(rgba);

    // Step 3: Brightness check on grayscale values
    const brightness = avgBrightness(gray);

    if (brightness < DARK_THRESHOLD) {
      return buildResult(false, 'dark', 20, 'POOR');
    }
    if (brightness > OVER_THRESHOLD) {
      return buildResult(false, 'overexposed', 20, 'POOR');
    }

    // Step 4: Laplacian Variance blur check
    const lv = laplacianVariance(gray, 100);

    if (lv < BLUR_THRESHOLD) {
      return buildResult(false, 'blur', 20, 'POOR');
    }

    // Quality scoring
    const goodBrightness = brightness >= GOOD_BRIGHT_MIN && brightness <= GOOD_BRIGHT_MAX;
    if (lv >= LV_GOOD && goodBrightness) {
      return buildResult(true, 'ok', 90, 'GOOD');
    }
    return buildResult(true, 'ok', 65, 'ACCEPTABLE');

  } catch {
    // Unexpected error → treat as poor quality
    return buildResult(false, 'blur', 20, 'POOR');
  }
}

// ---------------------------------------------------------------------------
// PDF validation — 3-step pipeline
// ---------------------------------------------------------------------------
export async function validatePDF(
  uri: string,
  fileSize: number,
): Promise<ValidationResult> {
  try {
    // Step 1: File size check
    if (fileSize < MIN_PDF_BYTES) {
      return buildResult(false, 'pdf_small', 20, 'POOR');
    }

    // Step 2: %PDF- signature check (first 8 bytes as base64)
    const headerB64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
      length: 8,
      position: 0,
    });

    if (!headerB64.startsWith('JVBER')) {
      return buildResult(false, 'pdf_invalid', 20, 'POOR');
    }

    // Step 3: Content keyword search in first 4096 bytes
    const sample = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
      length: 4096,
      position: 0,
    });

    const hasStream = sample.includes('stream');
    const hasFont   = sample.includes('/Font');
    const hasBT     = sample.includes('BT');
    const keywords  = [hasStream, hasFont, hasBT].filter(Boolean).length;

    if (keywords === 0) {
      return buildResult(false, 'pdf_empty', 20, 'POOR');
    }

    // Quality scoring
    if (keywords === 3) {
      return buildResult(true, 'ok', 90, 'GOOD');
    }
    return buildResult(true, 'ok', 65, 'ACCEPTABLE');

  } catch {
    return buildResult(false, 'pdf_invalid', 20, 'POOR');
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export async function validateFile(file: {
  uri: string;
  mimeType: string;
  size: number;
}): Promise<ValidationResult> {
  if (file.mimeType === 'application/pdf') {
    return validatePDF(file.uri, file.size);
  }
  return validateImage(file.uri, file.size);
}
