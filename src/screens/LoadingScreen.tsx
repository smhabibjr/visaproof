import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { AnalysisStrings, t } from '@/constants/strings';
import { useAnalysis } from '@/hooks/useAnalysis';
import { clearPendingAnalysis, getPendingAnalysis } from '@/utils/analysisStore';

type Props = { reportId: string };

const BAR_WIDTH = Dimensions.get('window').width - 80;

export default function LoadingScreen({ reportId }: Props) {
  const { status, progress, error, startAnalysis } = useAnalysis();

  // Progress bar animation
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Spinner rotation animation
  const rotation = useRef(new Animated.Value(0)).current;

  // Mount হলে analysis শুরু করা হয়
  useEffect(() => {
    const pending = getPendingAnalysis();
    clearPendingAnalysis();

    if (pending) {
      startAnalysis(pending.files, pending.language, reportId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spinner loop
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [rotation]);

  // Progress bar smooth animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (progress / 100) * BAR_WIDTH,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  // Done হলে ১ সেকেন্ড পর ReportScreen এ navigate করা হয়
  useEffect(() => {
    if (status === 'done') {
      const timer = setTimeout(() => {
        router.replace(`/report/${reportId}`);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, reportId]);

  const spinInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Pending object থেকে language নেওয়া যাচ্ছে না (already cleared)
  // তাই error message যেটা useAnalysis এ set হয়েছে সেটাই দেখানো হয়
  const statusText =
    status === 'preparing' ? AnalysisStrings.statusPreparing.bn :
    status === 'analyzing' ? AnalysisStrings.statusAnalyzing.bn :
    status === 'done'      ? AnalysisStrings.statusDone.bn :
    status === 'error'     ? (error ?? '') :
    '';

  const showSpinner  = status === 'preparing' || status === 'analyzing';
  const showProgress = status !== 'idle' && status !== 'error';
  const showEstimate = status === 'preparing' || status === 'analyzing';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Spinner */}
        {showSpinner && (
          <Animated.View
            style={[styles.spinner, { transform: [{ rotate: spinInterpolate }] }]}
          >
            <View style={styles.spinnerInner} />
          </Animated.View>
        )}

        {/* Done checkmark */}
        {status === 'done' && (
          <View style={styles.doneCircle}>
            <Text style={styles.doneCheck}>✓</Text>
          </View>
        )}

        {/* Error icon */}
        {status === 'error' && (
          <View style={styles.errorCircle}>
            <Text style={styles.errorMark}>!</Text>
          </View>
        )}

        {/* Status text */}
        <Text style={[styles.statusText, status === 'error' && styles.statusTextError]}>
          {statusText}
        </Text>

        {/* Estimated time */}
        {showEstimate && (
          <Text style={styles.estimateText}>
            {AnalysisStrings.estimatedTime.bn}
          </Text>
        )}

        {/* Progress bar */}
        {showProgress && (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: progressAnim }]} />
          </View>
        )}

        {/* Progress percentage */}
        {showProgress && (
          <Text style={styles.progressText}>{progress}%</Text>
        )}

        {/* Retry button on error */}
        {status === 'error' && (
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && styles.retryBtnPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.retryBtnText}>
              {AnalysisStrings.retryButton.bn}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  spinner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 5,
    borderColor: Colors.primaryLight,
    borderTopColor: Colors.primary,
  },
  spinnerInner: {
    position: 'absolute',
  },
  doneCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successBg,
    borderWidth: 3,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneCheck: {
    fontSize: 36,
    color: Colors.success,
    fontWeight: '700',
  },
  errorCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.errorBg,
    borderWidth: 3,
    borderColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMark: {
    fontSize: 36,
    color: Colors.error,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  statusTextError: {
    color: Colors.error,
  },
  estimateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressTrack: {
    width: BAR_WIDTH,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  retryBtnPressed: {
    backgroundColor: Colors.primaryDark,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
});
