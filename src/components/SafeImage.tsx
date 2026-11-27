import {useState} from 'react';
import {Compass} from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({src, alt, className = '', fallbackTitle}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-3 bg-[#EFF4FF] text-[#1E40AF] p-6 text-center ${className}`}
      >
        <Compass className="w-8 h-8 opacity-75" aria-hidden="true" />
        {fallbackTitle && <span className="text-sm font-medium">{fallbackTitle}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
