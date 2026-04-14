import { useEffect, useState } from 'react';
import { movieService } from '@/src/services/movieService';
import { Movie } from '@/src/types/movie';
import Hero from '@/src/components/Hero';
import MovieCard, { MovieCardSkeleton } from '@/src/components/MovieCard';
import ErrorState from '@/src/components/ErrorState';
import { ChevronRight, Zap, Film, Tv, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getApiSource } from '@/src/services/movieService';

export default function Home() {
  const { t } = useTranslation();
  const [newUpdates, setNewUpdates] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvSeries, setTvSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const source = getApiSource();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const safetyTimeout = setTimeout(() => {
      if (newUpdates.length === 0) {
        setLoading(false);
        setError(t('home.error_loading'));
      }
    }, 10000);

    try {
      const [newRes, movieRes, tvRes] = await Promise.all([
        movieService.getNewUpdates(1),
        movieService.getByCategory('phim-le', 1),
        movieService.getByCategory('phim-bo', 1),
      ]);
      setNewUpdates(newRes.items);
      setMovies(movieRes.items);
      setTvSeries(tvRes.items);
      setError(null);
    } catch (err) {
      if (newUpdates.length === 0) {
        setError(t('home.error_loading'));
      }
      console.error(err);
    } finally {
      setLoading(false);
      clearTimeout(safetyTimeout);
    }
  };

  useEffect(() => {
    loadData();
  }, [t, source]);

  if (error && newUpdates.length === 0) {
    return (
      <ErrorState 
        title="Lỗi kết nối" 
        message={error} 
        onRetry={loadData} 
      />
    );
  }

  const QUICK_MENU = [
    { name: 'Phim Mới', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', link: '/trending' },
    { name: 'Phim Lẻ', icon: Film, color: 'text-brand', bg: 'bg-brand/10', link: '/movies' },
    { name: 'Phim Bộ', icon: Tv, color: 'text-blue-400', bg: 'bg-blue-400/10', link: '/tv' },
    { name: 'Thịnh Hành', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10', link: '/trending' },
  ];

  return (
    <div className="pb-20 bg-surface">
      {loading && newUpdates.length === 0 ? (
        <div className="h-[70vh] bg-surface-light animate-pulse" />
      ) : (
        newUpdates[0] && <Hero movie={newUpdates[0]} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Quick Menu */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {QUICK_MENU.map((item) => (
            <Link 
              key={item.name}
              to={item.link}
              className="flex items-center gap-4 p-4 bg-surface-light border border-white/5 rounded-2xl hover:border-brand/50 transition-all group shadow-xl"
            >
              <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div>
                <span className="block text-sm font-black text-white uppercase tracking-tighter italic">{item.name}</span>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Khám phá</span>
              </div>
            </Link>
          ))}
        </div>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none">
                <span className="text-brand">/</span> {t('home.new_updates')}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Cập nhật hàng giờ</p>
              </div>
            </div>
            <Link to="/trending" className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-brand transition-all uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/10">
              {t('home.view_all')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="movie-grid">
            {loading && newUpdates.length === 0 ? (
              Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
            ) : (
              newUpdates.slice(1, 13).map((movie, idx) => (
                <MovieCard key={movie.slug} movie={movie} index={idx} />
              ))
            )}
          </div>
        </section>

        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none">
                <span className="text-brand">/</span> {t('home.latest_movies')}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Phim chiếu rạp & lẻ</p>
              </div>
            </div>
            <Link to="/movies" className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-brand transition-all uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/10">
              {t('home.view_all')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="movie-grid">
            {loading && movies.length === 0 ? (
              Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
            ) : (
              movies.slice(0, 12).map((movie, idx) => (
                <MovieCard key={movie.slug} movie={movie} index={idx} />
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none">
                <span className="text-brand">/</span> {t('home.latest_tv')}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Phim bộ dài tập</p>
              </div>
            </div>
            <Link to="/tv" className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-brand transition-all uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/10">
              {t('home.view_all')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="movie-grid">
            {loading && tvSeries.length === 0 ? (
              Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
            ) : (
              tvSeries.slice(0, 12).map((movie, idx) => (
                <MovieCard key={movie.slug} movie={movie} index={idx} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}


