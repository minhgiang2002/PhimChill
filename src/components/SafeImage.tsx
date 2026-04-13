import React, { useState } from 'react';
import { Film, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { movieService } from '@/src/services/movieService';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  secondarySrc?: string;
  movieSlug?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  secondarySrc,
  movieSlug,
  alt, 
  className, 
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [loadStage, setLoadStage] = useState<'primary' | 'secondary' | 'primary-proxy' | 'secondary-proxy' | 'api-fetch' | 'failed'>('primary');
  const [isFetching, setIsFetching] = useState(false);

  React.useEffect(() => {
    setCurrentSrc(src);
    setLoadStage('primary');
  }, [src]);

  const tryApiFetch = async () => {
    if (!alt || isFetching) {
      setLoadStage('failed');
      return;
    }

    setIsFetching(true);
    try {
      const response = await movieService.search(alt);
      
      if (!response.items || response.items.length === 0) {
        setLoadStage('failed');
        return;
      }

      const match = movieSlug 
        ? response.items.find(m => m.slug === movieSlug) 
        : response.items[0];

      const newSrc = match?.thumb_url || match?.poster_url;
      
      if (newSrc && newSrc !== src && newSrc !== secondarySrc) {
        setCurrentSrc(newSrc);
        setLoadStage('primary');
      } else {
        setLoadStage('failed');
      }
    } catch (error) {
      setLoadStage('failed');
    } finally {
      setIsFetching(false);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (loadStage === 'primary') {
      if (secondarySrc) {
        setCurrentSrc(secondarySrc);
        setLoadStage('secondary');
      } else {
        setLoadStage('api-fetch');
        tryApiFetch();
      }
    } else if (loadStage === 'secondary') {
      setLoadStage('api-fetch');
      tryApiFetch();
    } else {
      setLoadStage('failed');
    }
  };

  if (loadStage === 'api-fetch' || isFetching) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-surface-light text-gray-600", className)}>
        <Loader2 className="w-6 h-6 animate-spin opacity-20" />
      </div>
    );
  }

  if (loadStage === 'failed' || !currentSrc) {
    return (
      <div className={cn("flex flex-col items-center justify-center bg-surface-light text-gray-600", className)}>
        <Film className="w-12 h-12 mb-2 opacity-20" />
        <span className="text-[10px] uppercase tracking-widest font-bold opacity-20">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
};

export default SafeImage;
