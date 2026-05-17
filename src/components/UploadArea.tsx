import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { HomeStrings, t } from '@/constants/strings';
import type { Language, ValidatedFile } from '@/types';
import { formatSize } from '@/utils/format';
import FileRow from '@/components/FileRow';

type Props = {
  files: ValidatedFile[];
  language: Language;
  error: string | null;
  onOpenSourceSheet: () => void;
  onRemoveFile: (id: string) => void;
};

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
});
