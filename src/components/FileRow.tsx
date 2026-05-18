import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { ValidationStrings, t } from '@/constants/strings';
import type { Language, ValidatedFile, ValidationStatus } from '@/types';
import { formatSize } from '@/utils/format';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STATUS_COLOR: Record<ValidationStatus, string> = {
  checking: Colors.textSecondary,
  ready:    Colors.success,
  error:    Colors.error,
};

const STATUS_ICON: Record<ValidationStatus, IoniconName> = {
  checking: 'time-outline',
  ready:    'checkmark-circle',
  error:    'close-circle',
};

type Props = {
  file: ValidatedFile;
  language: Language;
  onRemove: () => void;
};

export default function FileRow({ file, language, onRemove }: Props) {
  const { validationStatus: status, validationResult } = file;
  const statusColor = STATUS_COLOR[status];
  const statusIcon  = STATUS_ICON[status];

  const statusLabel =
    status === 'ready'    ? (language === 'bn' ? 'প্রস্তুত' : 'Ready') :
    status === 'error'    ? '' :
    t(ValidationStrings.checking, language);

  const reasonText =
    status === 'error' && validationResult
      ? (language === 'bn' ? validationResult.reasonBn : validationResult.reasonEn)
      : null;

  const reasonColor = Colors.error;

  const fileIcon: IoniconName =
    file.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline';

  return (
    <View style={styles.fileRow}>
      <Ionicons name={fileIcon} size={22} color={Colors.primary} />

      <View style={styles.fileContent}>
        <View style={styles.fileRowLine1}>
          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {file.name}
          </Text>
          <Pressable
            onPress={onRemove}
            hitSlop={12}
            style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
          >
            <Ionicons name="close" size={13} color={Colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fileRowLine2}>
          <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
          <Ionicons name={statusIcon} size={16} color={statusColor} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        {reasonText !== null && (
          <Text style={[styles.reasonText, { color: reasonColor }]}>{reasonText}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  fileContent: {
    flex: 1,
    gap: 4,
  },
  fileRowLine1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnPressed: {
    backgroundColor: Colors.border,
  },
  fileRowLine2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 2,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 12,
  },
});
