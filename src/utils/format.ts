import type { Language } from '@/types';

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTHS_BN = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে',
];

function toBengaliDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
}

// ISO date string → "১৫ মে, ২০২৬" (bn) or "15 May, 2026" (en)
export function formatDate(isoString: string, language: Language): string {
  try {
    const d = new Date(isoString);
    const day   = d.getDate();
    const month = d.getMonth();
    const year  = d.getFullYear();

    if (language === 'bn') {
      return `${toBengaliDigits(day)} ${MONTHS_BN[month]}, ${toBengaliDigits(year)}`;
    }
    return `${day} ${MONTHS_EN[month]}, ${year}`;
  } catch {
    return '';
  }
}
