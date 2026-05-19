import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import type { Language } from '@/types';

type RowValue = string | boolean | null | undefined;
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  label: string;
  value: RowValue;
  lang: Language;
  highlight?: 'danger';
  isLink?: boolean;
  valueColor?: string;
}

function BoolValue({ value, lang }: { value: boolean | null; lang: Language }) {
  if (value === null) {
    return (
      <View style={styles.valueInner}>
        <Ionicons name="remove-circle-outline" size={16} color={Colors.textMuted} />
        <Text style={[styles.valueText, { color: Colors.textMuted }]}>
          {lang === 'bn' ? 'তথ্য নেই' : 'N/A'}
        </Text>
      </View>
    );
  }

  const icon: IoniconName = value ? 'checkmark-circle' : 'close-circle';
  const color = value ? Colors.success : Colors.error;
  const label = value
    ? (lang === 'bn' ? 'হ্যাঁ' : 'Yes')
    : (lang === 'bn' ? 'না' : 'No');

  return (
    <View style={styles.valueInner}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.valueText, { color }]}>{label}</Text>
    </View>
  );
}

export default function InfoRow({ label, value, lang, highlight, isLink, valueColor }: Props) {
  const isBoolOrNull = typeof value === 'boolean' || value === null;
  const isEmpty = !isBoolOrNull && (value === undefined || value === '');
  const displayStr = isEmpty
    ? (lang === 'bn' ? 'তথ্য নেই' : 'N/A')
    : String(value ?? '');

  const bgColor = highlight === 'danger' ? Colors.errorBg : 'transparent';

  function handleLinkPress(): void {
    if (typeof value === 'string' && value) {
      const url = value.startsWith('http') ? value : `https://${value}`;
      Linking.openURL(url).catch(() => {});
    }
  }

  return (
    <View style={[styles.row, { backgroundColor: bgColor }]}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>

      {isBoolOrNull ? (
        <BoolValue value={typeof value === 'boolean' ? value : null} lang={lang} />
      ) : isLink && typeof value === 'string' && value ? (
        <Pressable onPress={handleLinkPress} style={styles.valueInner}>
          <Ionicons name="link-outline" size={13} color={Colors.info} />
          <Text style={[styles.valueText, styles.linkText]} numberOfLines={1}>
            {displayStr}
          </Text>
        </Pressable>
      ) : (
        <Text
          style={[
            styles.valueText,
            isEmpty && styles.emptyText,
            valueColor ? { color: valueColor } : null,
          ]}
          numberOfLines={2}
        >
          {displayStr}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: 4,
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 12,
  },
  valueInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  emptyText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  linkText: {
    color: Colors.info,
    textDecorationLine: 'underline',
  },
});
