import type { Language, UploadedFile } from '@/types';

// Route params দিয়ে files পাঠানো সম্ভব না, তাই module-level store ব্যবহার করা হয়
interface PendingAnalysis {
  files: UploadedFile[];
  language: Language;
  reportId: string;
}

let pending: PendingAnalysis | null = null;

export function setPendingAnalysis(data: PendingAnalysis): void {
  pending = data;
}

export function getPendingAnalysis(): PendingAnalysis | null {
  return pending;
}

export function clearPendingAnalysis(): void {
  pending = null;
}
