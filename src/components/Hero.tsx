import { Play, Info, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '@/src/types/movie';
import { Link } from 'react-router-dom';
import { SafeImage } from './SafeImage';
import { useTranslation } from 'react-i18next';

interface HeroProps {
  movie: Movie;
}

export default function Hero({ movie }: HeroProps) {
  const { t } = useTranslation();

  return (
    <div className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] w-full overflow-hidden">
      {/* Background Image with slow zoom */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="h-full w-full"
        >
          <SafeImage
            src={movie.poster_url}
            secondarySrc={movie.thumb_url}
            alt={movie.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
        {/* Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/30 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <span className="bg-brand text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-1 rounded-sm uppercase tracking-[0.2em] shadow-lg shadow-brand/30">
              Nổi Bật
            </span>
            <span className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
              {movie.year && <span>{movie.year}</span>}
              {movie.year && <span className="w-1 h-1 bg-gray-500 rounded-full" />}
              <span className="text-brand">{movie.quality || 'HD'}</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 sm:mb-6 text-white leading-[1.1] uppercase italic drop-shadow-2xl">
            {movie.name}
          </h1>
          
          <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-8 sm:mb-10 line-clamp-3 max-w-2xl font-medium leading-relaxed drop-shadow-md">
            {movie.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link 
              to={`/movie/${movie.slug}`}
              className="group flex items-center gap-3 bg-brand hover:bg-white text-white hover:text-black px-8 sm:px-10 py-3 sm:py-4 rounded-full font-black transition-all duration-300 hover:scale-105 shadow-2xl shadow-brand/30 uppercase tracking-[0.2em] text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current group-hover:scale-110 transition-transform" />
              {t('detail.watch_now')}
            </Link>
            <Link 
              to={`/movie/${movie.slug}`}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/15 backdrop-blur-md text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-black transition-all duration-300 border border-white/10 hover:border-white/30 uppercase tracking-[0.2em] text-xs sm:text-sm"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              {t('detail.info')}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

