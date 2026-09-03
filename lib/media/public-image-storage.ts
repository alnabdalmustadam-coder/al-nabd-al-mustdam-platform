import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase';

const PUBLIC_IMAGE_BUCKET_OPTIONS = {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

type StorageErrorLike = {
  message?: string;
  status?: number | string;
  statusCode?: string;
};

function storageErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as StorageErrorLike).message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return 'Unknown image storage error';
}

function storageErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;
  const value = (error as StorageErrorLike).status ?? (error as StorageErrorLike).statusCode;
  const status = Number(value);
  return Number.isFinite(status) ? status : null;
}

function isMissingBucketError(error: unknown): boolean {
  const message = storageErrorMessage(error).toLowerCase();
  return storageErrorStatus(error) === 404 || message.includes('bucket not found') || message.includes('no such bucket');
}

function isExistingBucketError(error: unknown): boolean {
  const message = storageErrorMessage(error).toLowerCase();
  return storageErrorStatus(error) === 409 || message.includes('already exists');
}

function getAdminClient(): SupabaseClient {
  try {
    return getSupabaseAdmin();
  } catch (error) {
    console.error('Supabase Storage credentials are unavailable:', error);
    throw new Error('إعدادات حفظ الصور غير مكتملة على الخادم');
  }
}

async function ensurePublicImageBucket(
  supabase: SupabaseClient,
  bucketName: string,
): Promise<void> {
  const { data: bucket, error: lookupError } = await supabase.storage.getBucket(bucketName);

  if (!lookupError && bucket) {
    const restrictedMimeTypes = bucket.allowed_mime_types;
    const isMissingRequiredMimeType = Array.isArray(restrictedMimeTypes)
      && PUBLIC_IMAGE_BUCKET_OPTIONS.allowedMimeTypes.some(
        (mimeType) => !restrictedMimeTypes.includes(mimeType),
      );
    const hasInsufficientFileLimit = typeof bucket.file_size_limit === 'number'
      && bucket.file_size_limit < PUBLIC_IMAGE_BUCKET_OPTIONS.fileSizeLimit;

    if (!bucket.public || isMissingRequiredMimeType || hasInsufficientFileLimit) {
      const { error: updateError } = await supabase.storage.updateBucket(
        bucketName,
        PUBLIC_IMAGE_BUCKET_OPTIONS,
      );
      if (updateError) {
        throw new Error(`تعذر تهيئة حاوية الصور العامة: ${storageErrorMessage(updateError)}`);
      }
    }
    return;
  }

  if (lookupError && !isMissingBucketError(lookupError)) {
    throw new Error(`تعذر الاتصال بمساحة تخزين الصور: ${storageErrorMessage(lookupError)}`);
  }

  const { error: createError } = await supabase.storage.createBucket(
    bucketName,
    PUBLIC_IMAGE_BUCKET_OPTIONS,
  );

  // Another concurrent request may have created the fixed bucket first.
  if (createError && !isExistingBucketError(createError)) {
    throw new Error(`تعذر إنشاء حاوية الصور: ${storageErrorMessage(createError)}`);
  }
}

type UploadPublicWebpInput = {
  bucketName: string;
  objectPath: string;
  buffer: Buffer;
};

export async function uploadPublicWebp({
  bucketName,
  objectPath,
  buffer,
}: UploadPublicWebpInput): Promise<{ publicUrl: string; objectPath: string }> {
  const supabase = getAdminClient();
  await ensurePublicImageBucket(supabase, bucketName);

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(objectPath, buffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });

  if (error || !data) {
    console.error('Public image upload failed:', error);
    throw new Error('تعذر حفظ الصورة في قاعدة البيانات. حاول مرة أخرى.');
  }

  const storedPath = data.path || objectPath;
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storedPath);

  if (!publicUrlData?.publicUrl) {
    throw new Error('تم رفع الصورة لكن تعذر إنشاء رابط العرض العام');
  }

  return { publicUrl: publicUrlData.publicUrl, objectPath: storedPath };
}

export async function removeReplacedPublicImage(
  bucketName: string,
  existingImageUrl: string,
  replacementPath: string,
): Promise<void> {
  if (!existingImageUrl) return;

  const marker = `/${bucketName}/`;
  if (!existingImageUrl.includes(marker)) return;

  const encodedPath = existingImageUrl.split(marker)[1]?.split('?')[0];
  if (!encodedPath) return;

  let existingPath = encodedPath;
  try {
    existingPath = decodeURIComponent(encodedPath);
  } catch {
    // Keep the original path if the saved URL contains malformed encoding.
  }

  if (existingPath === replacementPath) return;

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.storage.from(bucketName).remove([existingPath]);
    if (error) {
      console.warn('Could not remove replaced public image:', storageErrorMessage(error));
    }
  } catch (error) {
    // A successful new upload must not be rolled back because stale-file cleanup failed.
    console.warn('Could not clean up replaced public image:', error);
  }
}
