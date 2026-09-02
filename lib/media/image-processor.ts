import 'server-only';
import sharp from 'sharp';

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fit?: keyof sharp.FitEnum;
}

/**
 * Converts any uploaded image (PNG, JPG, JPEG, AVIF, HEIC, TIFF, WebP)
 * into an ultra-optimized, compressed WebP buffer.
 */
export async function optimizeToWebp(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<{ buffer: Buffer; format: string; width: number; height: number; size: number }> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 82,
    fit = 'inside',
  } = options;

  let pipeline = sharp(inputBuffer, { failOnError: false })
    .rotate(); // Automatically orient based on EXIF data

  const metadata = await pipeline.metadata();

  // Resize only if image is larger than desired bounds
  if (
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight)
  ) {
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxHeight,
      fit,
      withoutEnlargement: true,
    });
  }

  // Compress strictly to WebP
  const optimizedBuffer = await pipeline
    .webp({
      quality,
      effort: 4, // Good balance of compression speed and file size
      smartSubsample: true,
    })
    .toBuffer();

  const optimizedMeta = await sharp(optimizedBuffer).metadata();

  return {
    buffer: optimizedBuffer,
    format: 'webp',
    width: optimizedMeta.width || 0,
    height: optimizedMeta.height || 0,
    size: optimizedBuffer.length,
  };
}

/**
 * Avatar specific optimizer:
 * Scales to standard 400x400 square cover with sharp WebP compression (~25-50KB)
 */
export async function optimizeAvatarToWebp(inputBuffer: Buffer): Promise<Buffer> {
  const res = await sharp(inputBuffer, { failOnError: false })
    .rotate()
    .resize(400, 400, {
      fit: 'cover',
      position: 'center',
    })
    .webp({
      quality: 82,
      effort: 4,
    })
    .toBuffer();

  return res;
}
