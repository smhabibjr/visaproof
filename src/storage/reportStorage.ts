import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FullReport, ReportListItem } from '@/types';

const LIST_KEY = 'reports_list';
const MAX_REPORTS = 50;

function reportKey(id: string): string {
  return `report_${id}`;
}

// রিপোর্টের list AsyncStorage থেকে পড়া হয়
export async function getAllReports(): Promise<ReportListItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReportListItem[];
  } catch {
    return [];
  }
}

// নতুন রিপোর্ট list এর শুরুতে যোগ করা হয়; সীমা ৫০
export async function saveReport(item: ReportListItem): Promise<void> {
  try {
    const existing = await getAllReports();
    const filtered = existing.filter((r) => r.id !== item.id);
    const updated = [item, ...filtered];

    // সীমা পার হলে সবচেয়ে পুরনোটা মুছে ফেলা হয়
    if (updated.length > MAX_REPORTS) {
      const removed = updated.splice(MAX_REPORTS);
      await Promise.all(removed.map((r) => AsyncStorage.removeItem(reportKey(r.id))));
    }

    await AsyncStorage.setItem(LIST_KEY, JSON.stringify(updated));
  } catch {
    // silently fail — storage errors must not crash the app
  }
}

// Full report (detail) সংরক্ষণ করা হয়
export async function saveFullReport(id: string, report: FullReport): Promise<void> {
  try {
    await AsyncStorage.setItem(reportKey(id), JSON.stringify(report));
  } catch {}
}

// ID দিয়ে full report পড়া হয়
export async function getReportById(id: string): Promise<FullReport | null> {
  try {
    const raw = await AsyncStorage.getItem(reportKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as FullReport;
  } catch {
    return null;
  }
}

// List থেকে এবং individual key থেকে দুটো জায়গা থেকেই মুছে দেওয়া হয়
export async function deleteReport(id: string): Promise<void> {
  try {
    const existing = await getAllReports();
    const updated = existing.filter((r) => r.id !== id);
    await AsyncStorage.setItem(LIST_KEY, JSON.stringify(updated));
    await AsyncStorage.removeItem(reportKey(id));
  } catch {}
}
