'use client';

import { useState, useEffect } from 'react';
import Icon from './Icon';

interface PlaceImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: string;
  iconSize?: number;
  iconClassName?: string;
}

export default function PlaceImage({
  src,
  alt = 'Tempat',
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full bg-gradient-to-br from-primary-container/30 to-primary/5 flex items-center justify-center',
  fallbackIcon = 'image',
  iconSize = 80,
  iconClassName = 'text-primary opacity-40',
}: PlaceImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!src || error) {
    return (
      <div className={containerClassName}>
        <Icon name={fallbackIcon} size={iconSize} className={iconClassName} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}
