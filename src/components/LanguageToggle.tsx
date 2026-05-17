import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { HomeStrings, t } from '@/constants/strings';
import type { Language } from '@/types';

type Props = {
  language: Language;
  onLanguageChange: (lang: Language) => void;
};

export default function LanguageToggle({ language, onLanguageChange }: Props) {
  return (
    <View style={styles.langRow}>
      <Text style={styles.langLabel}>{t(HomeStrings.languageLabel, language)}</Text>
      <View style={styles.langToggle}>
        <Pressable
          style={[styles.langBtn, language === 'bn' && styles.langBtnActive]}
          onPress={() => onLanguageChange('bn')}
        >
          <Text style={[styles.langBtnText, language === 'bn' && styles.langBtnTextActive]}>
            বাংলা
          </Text>
        </Pressable>
        <Pressable
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
          onPress={() => onLanguageChange('en')}
        >
          <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
            English
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
