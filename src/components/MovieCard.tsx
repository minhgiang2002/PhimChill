import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '@/src/types/movie';
import { SafeImage } from './SafeImage';
import { cn } from '@/src/lib/utils';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  key?: React.Key;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  // Determine if it's a "Hot" movie (based on quality or year for now)
  const isHot = movie.quality?.toLowerCase().includes('cam') === false && 
                (movie.year === new Date().getFullYear().toString() || movie.quality?.toLowerCase().includes('hd'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group relative flex flex-col"
    >
      <Link to={`/movie/${movie.slug}`} className="block relative overflow-hidden rounded-xl bg-surface-light aspect-[2/3] shadow-lg transition-all duration-500 group-hover:shadow-brand/20 group-hover:shadow-2xl">
        {/* Image with Zoom effect */}
        <SafeImage
          src={movie.thumb_url}
          secondarySrc={movie.poster_url}
          movieSlug={movie.slug}
          alt={movie.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center shadow-xl shadow-brand/40 transform group-hover:scale-110 transition-transform duration-300">
              <Play className="w-6 h-6 fill-white text-white ml-1" />
            </div>
          </motion.div>
          
          <div className="text-center">
             <span className="inline-block px-4 py-2 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
               Xem ngay
             </span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {isHot && (
            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg uppercase tracking-tighter italic animate-pulse">
              HOT
            </span>
          )}
          <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md border border-white/10 shadow-lg uppercase tracking-widest">
            {movie.quality}
          </span>
        </div>

        {/* Episode Badge */}
        <div className="absolute bottom-2 right-2 z-10">
           <div className="bg-brand/90 backdrop-blur-sm text-[9px] font-black text-white px-2 py-0.5 rounded-md shadow-lg uppercase tracking-tighter">
             {movie.current_episode}
           </div>
        </div>
        
        {/* Rating Badge (if available) */}
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/10 text-[9px] font-bold text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" />
            <span>8.5</span>
          </div>
        </div>
      </Link>
      
      {/* Movie Info */}
      <div className="mt-3 px-1">
        <Link to={`/movie/${movie.slug}`}>
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-brand transition-colors duration-300 min-h-[2.5rem]">
            {movie.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[70%]">
            {movie.language}
          </p>
          {movie.year && (
            <p className="text-[10px] text-gray-500 font-bold">{movie.year}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[2/3] w-full bg-surface-light rounded-xl" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-surface-light rounded w-full" />
        <div className="h-4 bg-surface-light rounded w-2/3" />
        <div className="flex justify-between mt-2">
          <div className="h-3 bg-surface-light rounded w-1/3" />
          <div className="h-3 bg-surface-light rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

