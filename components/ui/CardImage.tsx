import { ShimmerImage } from '@/components/ui/ShimmerImage';

interface CardImageProps {
  src?: string;
  alt: string;
  sizes: string;
  fallbackSrc?: string;
  preload?: boolean;
  className?: string;
}

/**
 * A stable 16:9 card thumbnail that never distorts or crops supplied artwork.
 * Portrait and unusually shaped uploads are presented over a soft, matching
 * backdrop so every card keeps the same rhythm without hiding image content.
 */
export function CardImage({
  src,
  alt,
  sizes,
  fallbackSrc = '/logo.webp',
  preload,
  className = '',
}: CardImageProps) {
  const imageSrc = src || fallbackSrc;

  return (
    <div
      className={`relative isolate aspect-video w-full shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <ShimmerImage
          key={`backdrop-${imageSrc}`}
          src={imageSrc}
          alt=""
          fill
          sizes="96px"
          quality={25}
          fallbackSrc={fallbackSrc}
          wrapperClassName="h-full w-full"
          className="object-cover scale-110 opacity-35 blur-2xl saturate-75"
        />
        <div className="absolute inset-0 bg-white/20" />
      </div>

      <div className="absolute inset-0 z-10">
        <ShimmerImage
          key={imageSrc}
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          fallbackSrc={fallbackSrc}
          wrapperClassName="h-full w-full"
          className="object-contain"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 ring-1 ring-inset ring-black/[0.04]" />
    </div>
  );
}
