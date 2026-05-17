import { useCallback, useEffect, useState } from 'react';

import * as reportStorage from '@/storage/reportStorage';
import type { ReportListItem } from '@/types';

// Feature 5+ এ real reports আসার আগে dummy data দিয়ে sidebar দেখানো হয়
const DUMMY_REPORTS: ReportListItem[] = [
  {
    id: 'demo1',
    createdAt: '2026-05-15T10:00:00Z',
    title: 'University of London',
    riskScore: 'SAFE',
    language: 'bn',
  },
  {
    id: 'demo2',
    createdAt: '2026-05-10T14:30:00Z',
    title: 'Oxford Global Institute',
    riskScore: 'SUSPICIOUS',
    language: 'en',
  },
  {
    id: 'demo3',
    createdAt: '2026-05-05T09:15:00Z',
    title: 'Euro Tech Academy',
    riskScore: 'SCAM',
    language: 'bn',
  },
];

export interface UseReportsReturn {
  reports: ReportListItem[];
  loading: boolean;
  deleteReport: (id: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading]  = useState(true);

  const refreshReports = useCallback(async () => {
    const stored = await reportStorage.getAllReports();
    // Real data না থাকলে dummy দেখানো হয়
    setReports(stored.length > 0 ? stored : DUMMY_REPORTS);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const deleteReport = useCallback(
    async (id: string) => {
      // Dummy reports আছে — শুধু local state থেকে সরানো হয়
      const isDummy = DUMMY_REPORTS.some((d) => d.id === id);
      if (!isDummy) {
        await reportStorage.deleteReport(id);
      }
      setReports((prev) => prev.filter((r) => r.id !== id));
    },
    []
  );

  return { reports, loading, deleteReport, refreshReports };
}
