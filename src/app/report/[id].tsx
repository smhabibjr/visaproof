import { useLocalSearchParams } from 'expo-router';

import ReportScreen from '@/screens/ReportScreen';

export default function ReportRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ReportScreen reportId={id ?? ''} />;
}
