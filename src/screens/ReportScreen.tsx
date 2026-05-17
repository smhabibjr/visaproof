import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, RiskColors } from '@/constants/colors';
import { ReportStrings, t } from '@/constants/strings';
import { getReportById } from '@/storage/reportStorage';
import type { FullReport, RiskScore } from '@/types';

type Props = { reportId: string };

function RiskBadge({ riskScore }: { riskScore: RiskScore }) {
  const palette = RiskColors[riskScore];
  const label   = t(ReportStrings.riskLabels[riskScore], 'en');
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.badgeText, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

export default function ReportScreen({ reportId }: Props) {
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportById(reportId).then((r) => {
      setReport(r);
      setLoading(false);
    });
  }, [reportId]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t(ReportStrings.title, 'en')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : report === null ? (
        // Dummy report এর জন্য placeholder
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.placeholderTitle}>{reportId}</Text>
          <Text style={styles.placeholderNote}>
            Full report UI — Feature 8 এ implement হবে
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.title}>{report.title}</Text>
          <RiskBadge riskScore={report.analysis.riskScore} />
          <Text style={styles.placeholderNote}>
            Full report UI — Feature 8 এ implement হবে
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  placeholderNote: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
