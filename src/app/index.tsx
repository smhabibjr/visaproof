import { router } from 'expo-router';

import HomeScreen from '@/screens/HomeScreen';
import type { Language, UploadedFile } from '@/types';
import { makeId } from '@/utils/id';
import { setPendingAnalysis } from '@/utils/analysisStore';

export default function HomeRoute() {
  function handleAnalyze(files: UploadedFile[], language: Language) {
    const reportId = makeId();
    setPendingAnalysis({ files, language, reportId });
    router.push(`/loading/${reportId}`);
  }

  return <HomeScreen onAnalyze={handleAnalyze} />;
}
