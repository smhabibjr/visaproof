import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

import { HomeStrings, t } from '@/constants/strings';
import type { Language, ValidatedFile } from '@/types';
import { validateFile } from '@/utils/fileValidator';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
type AllowedMime = (typeof ALLOWED_TYPES)[number];

function makeId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export interface UseFileUploadReturn {
  files: ValidatedFile[];
  language: Language;
  setLanguage: (l: Language) => void;
  error: string | null;
  showSourceSheet: boolean;
  setShowSourceSheet: (v: boolean) => void;
  canAnalyze: boolean;
  openCamera: () => Promise<void>;
  openGallery: () => Promise<void>;
  openDocumentPicker: () => Promise<void>;
  removeFile: (id: string) => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<ValidatedFile[]>([]);
  const [language, setLanguage] = useState<Language>('bn');
  const [error, setError] = useState<string | null>(null);
  const [showSourceSheet, setShowSourceSheet] = useState(false);

  // 'good' এবং 'acceptable' দুটোই Analyze এর জন্য যথেষ্ট; 'poor' বা 'checking' block করে
  const canAnalyze =
    files.length > 0 &&
    files.every((f) => f.validationStatus === 'good' || f.validationStatus === 'acceptable');

  // যাচাই শেষ হলে file এর status update করা হয়
  const runValidation = useCallback((id: string, file: { uri: string; mimeType: string; size: number }) => {
    validateFile(file).then((result) => {
      setFiles((prev) => {
        // file remove হয়ে গেলে ignore করা হয়
        if (!prev.find((f) => f.id === id)) return prev;

        const status =
          result.qualityLabel === 'GOOD' ? 'good' :
          result.qualityLabel === 'ACCEPTABLE' ? 'acceptable' :
          'poor';

        return prev.map((f) =>
          f.id === id
            ? { ...f, validationStatus: status, validationResult: result }
            : f
        );
      });
    });
  }, []);

  // Image assets (camera + gallery) একসাথে process করা হয়
  const addImageAssets = useCallback(
    (assets: ImagePicker.ImagePickerAsset[]) => {
      let validationError: string | null = null;
      const incoming: ValidatedFile[] = [];

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
            id: makeId(),
            uri: asset.uri,
            name: asset.fileName ?? `photo_${Date.now()}.jpg`,
            mimeType: mime,
            size,
            validationStatus: 'checking',
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

      // প্রতিটি নতুন file এর validation শুরু করা হয়
      for (const f of incoming) {
        runValidation(f.id, { uri: f.uri, mimeType: f.mimeType, size: f.size });
      }
    },
    [files, language, runValidation]
  );

  const openCamera = useCallback(async () => {
    setShowSourceSheet(false);
    setError(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError(language === 'bn' ? 'ক্যামেরার অনুমতি দিন' : 'Camera permission required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled) addImageAssets(result.assets);
  }, [language, addImageAssets]);

  const openGallery = useCallback(async () => {
    setShowSourceSheet(false);
    setError(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError(language === 'bn' ? 'গ্যালারির অনুমতি দিন' : 'Gallery permission required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) addImageAssets(result.assets);
  }, [language, addImageAssets]);

  const openDocumentPicker = useCallback(async () => {
    setShowSourceSheet(false);
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: [...ALLOWED_TYPES],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    let validationError: string | null = null;
    const incoming: ValidatedFile[] = [];

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
          id: makeId(),
          uri: asset.uri,
          name: asset.name,
          mimeType: mime as AllowedMime,
          size,
          validationStatus: 'checking',
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

    for (const f of incoming) {
      runValidation(f.id, { uri: f.uri, mimeType: f.mimeType, size: f.size });
    }
  }, [files, language, runValidation]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setError(null);
  }, []);

  return {
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
  };
}
