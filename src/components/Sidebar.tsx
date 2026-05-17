import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, RiskColors } from '@/constants/colors';
import { HistoryStrings, ReportStrings, t } from '@/constants/strings';
import { useReports } from '@/hooks/useReports';
import type { Language, ReportListItem, RiskScore } from '@/types';
import { formatDate } from '@/utils/format';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.82;

type Props = {
  visible: boolean;
  onClose: () => void;
  language: Language;
};

function RiskBadge({ riskScore, language }: { riskScore: RiskScore; language: Language }) {
  const palette = RiskColors[riskScore];
  const label   = t(ReportStrings.riskLabels[riskScore], language);
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <Text style={[styles.badgeText, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

function DeleteAction({ onDelete }: { onDelete: () => void }) {
  return (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Ionicons name="trash-outline" size={20} color={Colors.textOnPrimary} />
      <Text style={styles.deleteActionText}>মুছুন</Text>
    </TouchableOpacity>
  );
}

function ReportRow({
  item,
  language,
  onDelete,
  onPress,
}: {
  item: ReportListItem;
  language: Language;
  onDelete: () => void;
  onPress: () => void;
}) {
  const swipeRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    swipeRef.current?.close();
    onDelete();
  };

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      overshootRight={false}
      renderRightActions={() => <DeleteAction onDelete={handleDelete} />}
    >
      <Pressable
        style={({ pressed }) => [styles.reportRow, pressed && styles.reportRowPressed]}
        onPress={onPress}
      >
        <View style={styles.reportRowContent}>
          <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.reportDate}>{formatDate(item.createdAt, language)}</Text>
        </View>
        <RiskBadge riskScore={item.riskScore} language={language} />
      </Pressable>
    </Swipeable>
  );
}

export default function Sidebar({ visible, onClose, language }: Props) {
  const insets  = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const { reports, loading, deleteReport } = useReports();

  // Animate in/out যখন visible পরিবর্তন হয়
  Animated.timing(translateX, {
    toValue: visible ? 0 : -SIDEBAR_WIDTH,
    duration: 260,
    useNativeDriver: true,
  }).start();

  Animated.timing(opacity, {
    toValue: visible ? 1 : 0,
    duration: 260,
    useNativeDriver: true,
  }).start();

  if (!visible && translateX) {
    // Keep rendered but off-screen for smooth animation
  }

  const handleRowPress = (id: string) => {
    onClose();
    router.push(`/report/${id}`);
  };

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { width: SIDEBAR_WIDTH, transform: [{ translateX }], paddingTop: insets.top },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>
            {t(HistoryStrings.title, language)}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={22} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Report list */}
        {loading ? null : reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t(HistoryStrings.empty, language)}</Text>
            <Text style={styles.emptyHint}>{t(HistoryStrings.emptyHint, language)}</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ReportRow
                item={item}
                language={language}
                onDelete={() => deleteReport(item.id)}
                onPress={() => handleRowPress(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        {/* Storage warning — always visible at bottom */}
        <View style={[styles.warning, { paddingBottom: insets.bottom + 12 }]}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.warningText}>
            {t(HistoryStrings.storageWarning, language)}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  backdrop: {
    backgroundColor: Colors.overlay,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  reportRowPressed: {
    backgroundColor: Colors.surfaceSecondary,
  },
  reportRowContent: {
    flex: 1,
    gap: 3,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    gap: 4,
  },
  deleteActionText: {
    color: Colors.textOnPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceSecondary,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
