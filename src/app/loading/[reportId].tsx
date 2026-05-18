import { useLocalSearchParams } from 'expo-router';

import LoadingScreen from '@/screens/LoadingScreen';

export default function LoadingRoute() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  return <LoadingScreen reportId={reportId ?? ''} />;
}
