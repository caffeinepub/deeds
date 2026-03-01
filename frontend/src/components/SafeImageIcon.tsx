import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageIconProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackText?: string;
}

export default function SafeImageIcon({
  src,
  alt,
  className = '',
  fallbackIcon,
  fallbackText,
}: SafeImageIconProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {fallbackIcon || <ImageOff className="h-full w-full opacity-50" />}
        {fallbackText && <span className="ml-2 text-sm text-muted-foreground">{fallbackText}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
