import { useCallback, useRef, useState } from 'react';

import { AnalysisStrings, t } from '@/constants/strings';
import { analyzeDocuments } from '@/services/claudeService';
import { saveFullReport, saveReport } from '@/storage/reportStorage';
import type { FullReport, Language, ReportListItem, UploadedFile } from '@/types';

export type AnalysisStatus = 'idle' | 'preparing' | 'analyzing' | 'done' | 'error';

export interface UseAnalysisReturn {
  status: AnalysisStatus;
  progress: number;
  error: string | null;
  startAnalysis: (files: UploadedFile[], language: Language, reportId: string) => Promise<void>;
}

export function useAnalysis(): UseAnalysisReturn {
  const [status,   setStatus]   = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState<string | null>(null);

  // interval ID — ref দিয়ে রাখা হয় যাতে cleanup করা যায়
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearProgressInterval = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAnalysis = useCallback(
    async (files: UploadedFile[], language: Language, reportId: string) => {
      setError(null);
      setStatus('preparing');
      setProgress(10);

      // API call শুরু হলে progress 50 থেকে fake increment শুরু
      setStatus('analyzing');
      setProgress(50);

      // প্রতি ২ সেকেন্ডে +8, সর্বোচ্চ ৯০ পর্যন্ত
      let currentProgress = 50;
      intervalRef.current = setInterval(() => {
        currentProgress = Math.min(currentProgress + 8, 90);
        setProgress(currentProgress);
      }, 2000);

      const result = await analyzeDocuments({ files, language, reportId });

      clearProgressInterval();

      if (!result.success) {
        setStatus('error');
        // Error code → bilingual message
        const msgMap: Record<string, string> = {
          NETWORK_ERROR:    t(AnalysisStrings.errorNetwork,      language),
          API_KEY_ERROR:    t(AnalysisStrings.errorApiKey,       language),
          FILE_TOO_LARGE:   t(AnalysisStrings.errorFileTooLarge, language),
          PARSE_ERROR:      t(AnalysisStrings.errorParse,        language),
          TIMEOUT:          t(AnalysisStrings.errorTimeout,      language),
          UNKNOWN_ERROR:    t(AnalysisStrings.errorUnknown,      language),
        };
        setError(msgMap[result.error] ?? t(AnalysisStrings.errorUnknown, language));
        return;
      }

      // রিপোর্ট AsyncStorage এ সংরক্ষণ করা হয়
      const analysis = result.data;
      const title = analysis.universityVerification.name || files[0]?.name || 'Document';

      const listItem: ReportListItem = {
        id: reportId,
        createdAt: new Date().toISOString(),
        title,
        riskScore: analysis.riskScore,
        language,
      };

      const fullReport: FullReport = {
        ...listItem,
        analysis,
        fileNames: files.map((f) => f.name),
        paymentTransactionId: '',  // Feature 5 এ যোগ হবে
      };

      await saveReport(listItem);
      await saveFullReport(reportId, fullReport);

      setProgress(100);
      setStatus('done');
    },
    []
  );

  return { status, progress, error, startAnalysis };
}
