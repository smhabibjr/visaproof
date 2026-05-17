import HomeScreen from '@/screens/HomeScreen';
import type { Language, UploadedFile } from '@/types';

export default function HomeRoute() {
  // TODO: navigate to PaymentScreen when onAnalyze fires
  function handleAnalyze(files: UploadedFile[], language: Language) {
    console.log('analyze', { fileCount: files.length, language });
  }

  return <HomeScreen onAnalyze={handleAnalyze} />;
}
