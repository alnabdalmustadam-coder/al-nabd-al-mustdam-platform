'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ShimmerImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  wrapperClassName?: string;
}

export function ShimmerImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  fallbackSrc = '/logo.webp',
  fill,
  width,
  height,
  priority,
  ...rest
}: ShimmerImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const finalSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden ${fill ? 'w-full h-full' : ''} ${wrapperClassName}`}>
      {/* Shimmer Placeholder Layer */}
      {!isLoaded && (
        <div
          className="absolute inset-0 z-10 animate-skeleton-shimmer w-full h-full rounded-inherit pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Actual Optimized Image */}
      <Image
        src={finalSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        className={`${className} transition-opacity duration-400 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) setHasError(true);
          setIsLoaded(true);
        }}
        {...rest}
      />
    </div>
  );
}
