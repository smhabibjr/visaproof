import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { AppStrings, HomeStrings, t } from '@/constants/strings';
import type { Language, UploadedFile } from '@/types';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  onAnalyze: (files: UploadedFile[], language: Language) => void;
};

export default function HomeScreen({ onAnalyze }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [language, setLanguage] = useState<Language>('bn');
  const [error, setError] = useState<string | null>(null);
  const [showSourceSheet, setShowSourceSheet] = useState(false);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const canAnalyze = files.length > 0;

  // Shared validation + merge logic for image assets (camera & gallery)
  const addImageAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      let validationError: string | null = null;
      const incoming: UploadedFile[] = [];

      for (const asset of assets) {
        const size = asset.fileSize ?? 0;
        const mime = (asset.mimeType ?? 'image/jpeg') as AllowedMime;

        if (size > MAX_FILE_BYTES) {
          validationError = t(HomeStrings.fileTooLarge, language);
          continue;
        }
        const isDuplicate = files.some(
          (f) => f.name === asset.fileName && f.size === size
        );
        if (!isDuplicate) {
          incoming.push({
            uri: asset.uri,
            name: asset.fileName ?? `photo_${Date.now()}.jpg`,
            mimeType: mime,
            size,
          });
        }
      }

      const merged = [...files, ...incoming];
      if (merged.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) {
        setError(t(HomeStrings.totalTooLarge, language));
        return;
      }
      setFiles(merged);
      if (validationError) setError(validationError);
    },
    [files, language]
  );

  const pickFromCamera = useCallback(async () => {
    setShowSourceSheet(false);
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError(
        language === 'bn' ? 'ক্যামেরার অনুমতি দিন' : 'Camera permission required'
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled) addImageAssets(result.assets);
  }, [language, addImageAssets]);

  const pickFromGallery = useCallback(async () => {
    setShowSourceSheet(false);
    setError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError(
        language === 'bn' ? 'গ্যালারির অনুমতি দিন' : 'Gallery permission required'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) addImageAssets(result.assets);
  }, [language, addImageAssets]);

  const pickFiles = useCallback(async () => {
    setShowSourceSheet(false);
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: [...ALLOWED_TYPES],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    let validationError: string | null = null;
    const incoming: UploadedFile[] = [];

    for (const asset of result.assets) {
      const mime = asset.mimeType ?? '';
      const size = asset.size ?? 0;

      if (!ALLOWED_TYPES.includes(mime as AllowedMime)) {
        validationError = t(HomeStrings.unsupportedFormat, language);
        continue;
      }
      if (size > MAX_FILE_BYTES) {
        validationError = t(HomeStrings.fileTooLarge, language);
        continue;
      }
      const isDuplicate = files.some(
        (f) => f.name === asset.name && f.size === size
      );
      if (!isDuplicate) {
        incoming.push({
          uri: asset.uri,
          name: asset.name,
          mimeType: mime as AllowedMime,
          size,
        });
      }
    }

    const merged = [...files, ...incoming];
    if (merged.reduce((s, f) => s + f.size, 0) > MAX_TOTAL_BYTES) {
      setError(t(HomeStrings.totalTooLarge, language));
      return;
    }
    setFiles(merged);
    if (validationError) setError(validationError);
  }, [files, language]);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!canAnalyze) {
      setError(t(HomeStrings.noFilesSelected, language));
      return;
    }
    onAnalyze(files, language);
  }, [canAnalyze, files, language, onAnalyze]);

  return (
    <>
      {/* ── Source picker bottom sheet ── */}
      <Modal
        visible={showSourceSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSourceSheet(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setShowSourceSheet(false)}
        >
          {/* Inner View stops backdrop tap from propagating through the sheet */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {t(HomeStrings.uploadSheetTitle, language)}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
              onPress={pickFromCamera}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.sheetOptionText}>{t(HomeStrings.camera, language)}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
              onPress={pickFromGallery}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="images-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.sheetOptionText}>{t(HomeStrings.gallery, language)}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
              onPress={pickFiles}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="document-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.sheetOptionText}>{t(HomeStrings.files, language)}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
              onPress={() => setShowSourceSheet(false)}
            >
              <Text style={styles.sheetCancelText}>{t(AppStrings.cancel, language)}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <SafeAreaView style={styles.safe}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.appName}>{t(AppStrings.appName, language)}</Text>
          <Text style={styles.tagline}>{t(AppStrings.tagline, language)}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Language toggle ── */}
          <View style={styles.langRow}>
            <Text style={styles.langLabel}>{t(HomeStrings.languageLabel, language)}</Text>
            <View style={styles.langToggle}>
              <Pressable
                style={[styles.langBtn, language === 'bn' && styles.langBtnActive]}
                onPress={() => setLanguage('bn')}
              >
                <Text style={[styles.langBtnText, language === 'bn' && styles.langBtnTextActive]}>
                  বাংলা
                </Text>
              </Pressable>
              <Pressable
                style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                  English
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ── Upload zone ── */}
          <Pressable
            style={({ pressed }) => [styles.uploadZone, pressed && styles.uploadZonePressed]}
            onPress={() => setShowSourceSheet(true)}
          >
            <Ionicons name="cloud-upload-outline" size={48} color={Colors.primary} />
            <Text style={styles.uploadTitle}>{t(HomeStrings.uploadButton, language)}</Text>
            <Text style={styles.uploadHint}>{t(HomeStrings.uploadHint, language)}</Text>
          </Pressable>

          {/* ── Validation error ── */}
          {error !== null && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Selected files ── */}
          {files.length > 0 && (
            <View style={styles.fileCard}>
              <View style={styles.fileCardHeader}>
                <Text style={styles.fileCount}>
                  {files.length} {t(HomeStrings.filesSelected, language)}
                </Text>
                <Text style={styles.totalSizeText}>
                  {t(HomeStrings.totalSize, language)}: {formatSize(totalSize)}
                </Text>
              </View>

              {files.map((file, index) => (
                <View key={`${file.name}-${index}`} style={styles.fileRow}>
                  <Ionicons
                    name={file.mimeType === 'application/pdf' ? 'document-text-outline' : 'image-outline'}
                    size={24}
                    color={Colors.primary}
                  />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                      {file.name}
                    </Text>
                    <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
                  </View>
                  <Pressable
                    onPress={() => removeFile(index)}
                    hitSlop={12}
                    style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
                  >
                    <Ionicons name="close" size={14} color={Colors.error} />
                  </Pressable>
                </View>
              ))}

              <Pressable style={styles.addMoreBtn} onPress={() => setShowSourceSheet(true)}>
                <Text style={styles.addMoreText}>+ {t(HomeStrings.addMoreFiles, language)}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* ── Analyze button (sticky bottom) ── */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!canAnalyze}
          >
            <Text style={[styles.analyzeBtnText, !canAnalyze && styles.analyzeBtnTextDisabled]}>
              {t(HomeStrings.analyzeButton, language)}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Language toggle
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  langBtnActive: {
    backgroundColor: Colors.primary,
  },
  langBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langBtnTextActive: {
    color: Colors.textOnPrimary,
  },

  // Upload zone
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

  // Error
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

  // File list card
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
    paddingVertical: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fileCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalSizeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.errorBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnPressed: {
    backgroundColor: Colors.error,
  },
  addMoreBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Footer / Analyze button
  footer: {
    padding: 20,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  analyzeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeBtnDisabled: {
    backgroundColor: Colors.surfaceSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    letterSpacing: 0.3,
  },
  analyzeBtnTextDisabled: {
    color: Colors.textMuted,
  },

  // Source picker bottom sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 36,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sheetOptionPressed: {
    backgroundColor: Colors.primaryLight,
  },
  sheetOptionIconWrap: {
    width: 36,
    alignItems: 'center',
  },
  sheetOptionText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sheetCancel: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
  },
  sheetCancelPressed: {
    backgroundColor: Colors.border,
  },
  sheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
