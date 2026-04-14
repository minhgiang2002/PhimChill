import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Loader2 } from 'lucide-react';
import { movieService } from '@/src/services/movieService';
import { Movie } from '@/src/types/movie';
import SafeImage from './SafeImage';

interface AIMovieCardProps {
  keyword: string;
  key?: React.Key;
}

export default function AIMovieCard({ keyword }: AIMovieCardProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!keyword) {
        setLoading(false);
        return;
      }
      try {
        const res = await movieService.search(keyword.trim());
        if (res.items && res.items.length > 0) {
          setMovie(res.items[0]);
        }
      } catch (error) {
        console.error("Error fetching movie for AI card:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [keyword]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-white/5 rounded-xl border border-white/10 my-2 h-24">
        <Loader2 className="w-5 h-5 text-brand animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <span className="inline-block px-2 py-1 bg-white/10 rounded text-brand font-medium mx-1">
        {keyword}
      </span>
    );
  }

  return (
    <Link 
      to={`/movie/${movie.slug}`}
      className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 my-2 transition-colors group"
    >
      <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
        <SafeImage 
          src={movie.thumb_url} 
          alt={movie.name}
          movieSlug={movie.slug}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">
          {movie.name}
        </h4>
        <p className="text-xs text-gray-400 truncate mt-1">
          {movie.original_name}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] bg-brand/20 text-brand px-2 py-0.5 rounded font-bold">
            {movie.quality}
          </span>
          <span className="text-[10px] text-gray-500">
            {movie.year}
          </span>
        </div>
      </div>
    </Link>
  );
}
