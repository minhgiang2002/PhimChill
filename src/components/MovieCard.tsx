import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '@/src/types/movie';
import { SafeImage } from './SafeImage';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  key?: React.Key;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative"
    >
      <Link to={`/movie/${movie.slug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-light">
          <SafeImage
            src={movie.thumb_url}
            secondarySrc={movie.poster_url}
            movieSlug={movie.slug}
            alt={movie.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-200 shadow-lg">
              <Play className="w-5 h-5 fill-white text-white ml-1" />
            </div>
          </div>

          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold border border-white/10">
            <span className="text-brand">{movie.quality}</span>
          </div>

          <div className="absolute bottom-1.5 left-1.5">
             <div className="bg-brand/90 backdrop-blur-sm text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
               {movie.current_episode}
             </div>
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-brand transition-colors">
            {movie.name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-500 line-clamp-1">{movie.language}</p>
            {movie.year && (
              <>
                <span className="text-[8px] text-gray-600">•</span>
                <p className="text-[10px] text-gray-500">{movie.year}</p>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

