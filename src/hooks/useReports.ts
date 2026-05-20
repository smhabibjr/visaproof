import { useCallback, useEffect, useState } from 'react';

import * as reportStorage from '@/storage/reportStorage';
import type { ReportListItem } from '@/types';

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
    setReports(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);

  const deleteReport = useCallback(
    async (id: string) => {
      await reportStorage.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    },
    []
  );

  return { reports, loading, deleteReport, refreshReports };
}
