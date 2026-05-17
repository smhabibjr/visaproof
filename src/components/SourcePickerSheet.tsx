import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { AppStrings, HomeStrings, t } from '@/constants/strings';
import type { Language } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onFiles: () => void;
  language: Language;
};

export default function SourcePickerSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
  onFiles,
  language,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {t(HomeStrings.uploadSheetTitle, language)}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
            onPress={onCamera}
          >
            <View style={styles.sheetOptionIconWrap}>
              <Ionicons name="camera-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.sheetOptionText}>{t(HomeStrings.camera, language)}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
            onPress={onGallery}
          >
            <View style={styles.sheetOptionIconWrap}>
              <Ionicons name="images-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.sheetOptionText}>{t(HomeStrings.gallery, language)}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.sheetOption, pressed && styles.sheetOptionPressed]}
            onPress={onFiles}
          >
            <View style={styles.sheetOptionIconWrap}>
              <Ionicons name="document-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.sheetOptionText}>{t(HomeStrings.files, language)}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}
            onPress={onClose}
          >
            <Text style={styles.sheetCancelText}>{t(AppStrings.cancel, language)}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
