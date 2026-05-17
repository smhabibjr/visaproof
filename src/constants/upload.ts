export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 15 * 1024 * 1024;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;
export type AllowedMime = (typeof ALLOWED_TYPES)[number];
