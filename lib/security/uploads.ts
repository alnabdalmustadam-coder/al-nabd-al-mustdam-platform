import 'server-only';

type UploadPolicy = {
  maxBytes: number;
  allowedMimeTypes: readonly string[];
  allowedExtensions: readonly string[];
};

export function getSafeExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  return /^[a-z0-9]{1,8}$/.test(extension) ? extension : '';
}

export function validateUpload(file: File, policy: UploadPolicy): string | null {
  if (!file.name || file.size <= 0) return 'الملف فارغ أو غير صالح';
  if (file.size > policy.maxBytes) {
    return `حجم الملف أكبر من الحد المسموح (${Math.round(policy.maxBytes / 1024 / 1024)} MB)`;
  }

  const extension = getSafeExtension(file.name);
  if (!extension || !policy.allowedExtensions.includes(extension)) {
    return 'امتداد الملف غير مسموح';
  }

  const mime = file.type.toLowerCase();
  if (!mime || !policy.allowedMimeTypes.includes(mime)) {
    return 'نوع الملف غير مسموح';
  }

  return null;
}

export const IMAGE_UPLOAD_POLICY = {
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'] as const,
};

export const ATTACHMENT_UPLOAD_POLICY = {
  maxBytes: 25 * 1024 * 1024,
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-7z-compressed',
  ] as const,
  allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', '7z'] as const,
};

export const VIDEO_UPLOAD_POLICY = {
  maxBytes: 2 * 1024 * 1024 * 1024,
  allowedMimeTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
  ] as const,
  allowedExtensions: ['mp4', 'webm', 'mov', 'mkv'] as const,
};
