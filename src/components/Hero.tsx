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
    <div className="relative h-[60vh] sm:h-[65vh] md:h-[80vh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <SafeImage
          src={movie.poster_url}
          secondarySrc={movie.thumb_url}
          alt={movie.name}
          className="h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <span className="bg-brand text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-widest">Featured</span>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400">
              {movie.year && `${movie.year} • `}{movie.quality}
            </span>
          </div>

          <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-3 sm:mb-4 text-white leading-tight uppercase italic">
            {movie.name}
          </h1>
          
          <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-6 sm:mb-8 line-clamp-2 max-w-xl font-medium leading-relaxed">
            {movie.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link 
              to={`/movie/${movie.slug}`}
              className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-black transition-all hover:scale-105 shadow-xl shadow-brand/20 uppercase tracking-widest text-[10px] sm:text-sm"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              {t('detail.watch_now')}
            </Link>
            <Link 
              to={`/movie/${movie.slug}`}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl font-black transition-all border border-white/10 uppercase tracking-widest text-[10px] sm:text-sm"
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

