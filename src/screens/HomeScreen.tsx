import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { AppStrings, HomeStrings, t } from '@/constants/strings';
import type { Language } from '@/types';
import UploadArea from '@/components/UploadArea';
import { useFileUpload } from '@/hooks/useFileUpload';

type Props = {
  onAnalyze: (files: import('@/types').UploadedFile[], language: Language) => void;
};

export default function HomeScreen({ onAnalyze }: Props) {
  const {
    files,
    language,
    setLanguage,
    error,
    showSourceSheet,
    setShowSourceSheet,
    canAnalyze,
    openCamera,
    openGallery,
    openDocumentPicker,
    removeFile,
  } = useFileUpload();


  return (
    <>
      {/* ── Source picker bottom sheet ── */}
      <Modal
        visible={showSourceSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSourceSheet(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setShowSourceSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>
              {t(HomeStrings.uploadSheetTitle, language)}
            </Text>

            <Pressable
              style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
              onPress={openCamera}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.sheetOptionText}>{t(HomeStrings.camera, language)}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
              onPress={openGallery}
            >
              <View style={styles.sheetOptionIconWrap}>
                <Ionicons name="images-outline" size={28} color={Colors.primary} />
              </View>
              <Text style={styles.sheetOptionText}>{t(HomeStrings.gallery, language)}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
              onPress={openDocumentPicker}
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

          {/* ── Upload zone + file list ── */}
          <UploadArea
            files={files}
            language={language}
            error={error}
            onOpenSourceSheet={() => setShowSourceSheet(true)}
            onRemoveFile={removeFile}
          />
        </ScrollView>

        {/* ── Analyze button (sticky bottom) ── */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnDisabled]}
            onPress={() => {
              if (canAnalyze) onAnalyze(files, language);
            }}
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
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
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
