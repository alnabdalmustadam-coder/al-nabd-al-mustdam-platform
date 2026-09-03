import { ShimmerImage } from '@/components/ui/ShimmerImage';

interface CardImageProps {
  src?: string;
  alt: string;
  sizes: string;
  fallbackSrc?: string;
  preload?: boolean;
}

/** Full-width content artwork with its natural proportions, without cropping or zoom. */
export function CardImage({ src, alt, sizes, fallbackSrc = '/logo.webp', preload }: CardImageProps) {
  const imageSrc = src || fallbackSrc;

  return (
    <ShimmerImage
      key={imageSrc}
      src={imageSrc}
      alt={alt}
      width={1200}
      height={675}
      sizes={sizes}
      preload={preload}
      fallbackSrc={fallbackSrc}
      wrapperClassName="w-full shrink-0"
      className="block h-auto w-full"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}
