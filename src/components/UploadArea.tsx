import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { HomeStrings, ValidationStrings, t } from '@/constants/strings';
import type { Language, ValidatedFile, ValidationStatus } from '@/types';

type Props = {
  files: ValidatedFile[];
  language: Language;
  error: string | null;
  onOpenSourceSheet: () => void;
  onRemoveFile: (id: string) => void;
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const STATUS_COLOR: Record<ValidationStatus, string> = {
  checking:   Colors.textSecondary,
  good:       Colors.success,
  acceptable: Colors.warning,
  poor:       Colors.error,
};

const STATUS_ICON: Record<ValidationStatus, IoniconName> = {
  checking:   'time-outline',
  good:       'checkmark-circle',
  acceptable: 'warning',
  poor:       'close-circle',
};

function FileRow({
  file,
  language,
  onRemove,
}: {
  file: ValidatedFile;
  language: Language;
  onRemove: () => void;
}) {
  const { validationStatus: status, validationResult } = file;
  const statusColor = STATUS_COLOR[status];
  const statusIcon  = STATUS_ICON[status];

  const statusLabel =
    status === 'good'       ? t(ValidationStrings.good, language) :
    status === 'acceptable' ? t(ValidationStrings.acceptable, language) :
    status === 'poor'       ? t(ValidationStrings.poor, language) :
    t(ValidationStrings.checking, language);

  // Line 3: poor → specific reason in active language, acceptable → generic warning
  const poorReason =
    language === 'bn'
      ? validationResult?.reasonBn
      : validationResult?.reasonEn;

  const reasonText =
    status === 'poor' && poorReason
      ? poorReason
      : status === 'acceptable'
        ? t(ValidationStrings.acceptableWarning, language)
        : null;

  const reasonColor = status === 'poor' ? Colors.error : Colors.warning;

  const fileIcon: IoniconName =
    file.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline';

  return (
    <View style={styles.fileRow}>
      {/* File type icon — aligns with line 1 */}
      <Ionicons name={fileIcon} size={22} color={Colors.primary} />

      {/* Content column */}
      <View style={styles.fileContent}>
        {/* Line 1: filename + remove button */}
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

        {/* Line 2: size + status icon + status label */}
        <View style={styles.fileRowLine2}>
          <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
          <Ionicons name={statusIcon} size={16} color={statusColor} />
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        {/* Line 3: reason (only for poor or acceptable) */}
        {reasonText !== null && (
          <Text style={[styles.reasonText, { color: reasonColor }]}>{reasonText}</Text>
        )}
      </View>
    </View>
  );
}

export default function UploadArea({
  files,
  language,
  error,
  onOpenSourceSheet,
  onRemoveFile,
}: Props) {
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const hasFiles  = files.length > 0;

  return (
    <>
      {/* ── Upload zone: only when no files selected ── */}
      {!hasFiles && (
        <Pressable
          style={({ pressed }) => [styles.uploadZone, pressed && styles.uploadZonePressed]}
          onPress={onOpenSourceSheet}
        >
          <Ionicons name="cloud-upload-outline" size={48} color={Colors.primary} />
          <Text style={styles.uploadTitle}>{t(HomeStrings.uploadButton, language)}</Text>
          <Text style={styles.uploadHint}>{t(HomeStrings.uploadHint, language)}</Text>
        </Pressable>
      )}

      {/* ── Validation error (size / format) ── */}
      {error !== null && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── File list card ── */}
      {hasFiles && (
        <View style={styles.fileCard}>
          {/* Header: count + total size + add more button */}
          <View style={styles.fileCardHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.fileCount}>
                {files.length} {t(HomeStrings.filesSelected, language)}
              </Text>
              <Text style={styles.totalSizeText}>{formatSize(totalSize)}</Text>
            </View>
            <Pressable
              onPress={onOpenSourceSheet}
              style={({ pressed }) => [styles.addMoreBtn, pressed && styles.addMoreBtnPressed]}
            >
              <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
              <Text style={styles.addMoreText}>{t(HomeStrings.addMoreFiles, language)}</Text>
            </Pressable>
          </View>

          {/* File rows */}
          {files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              language={language}
              onRemove={() => onRemoveFile(file.id)}
            />
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Upload zone (shown only when no files)
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  uploadZonePressed: {
    backgroundColor: Colors.border,
    borderColor: Colors.primaryDark,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  uploadHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Error box
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
  },

  // File card
  fileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  fileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    gap: 2,
  },
  fileCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalSizeText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  addMoreBtnPressed: {
    backgroundColor: Colors.border,
  },
  addMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  // File row
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

  // Line 1: filename + remove
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

  // Line 2: size + status icon + status label
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

  // Line 3: reason text
  reasonText: {
    fontSize: 12,
  },
});
