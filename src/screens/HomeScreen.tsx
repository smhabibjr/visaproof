import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { AppStrings, HomeStrings, t } from '@/constants/strings';
import type { Language } from '@/types';
import LanguageToggle from '@/components/LanguageToggle';
import SourcePickerSheet from '@/components/SourcePickerSheet';
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
      <SourcePickerSheet
        visible={showSourceSheet}
        onClose={() => setShowSourceSheet(false)}
        onCamera={openCamera}
        onGallery={openGallery}
        onFiles={openDocumentPicker}
        language={language}
      />

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
          <LanguageToggle language={language} onLanguageChange={setLanguage} />

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
});
