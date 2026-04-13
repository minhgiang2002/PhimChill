import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { movieService } from '@/src/services/movieService';
import { Movie, Paginate } from '@/src/types/movie';
import MovieCard, { MovieCardSkeleton } from '@/src/components/MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MovieList() {
  const { t } = useTranslation();
  const { type, slug } = useParams<{ type: string; slug: string }>();
  const location = useLocation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [paginate, setPaginate] = useState<Paginate | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const getTitle = () => {
    if (location.pathname.includes('/trending')) return t('nav.trending');
    if (location.pathname.includes('/movies')) return t('nav.movies');
    if (location.pathname.includes('/tv')) return t('nav.tv_series');
    if (type === 'the-loai') return `${t('list.genre')}: ${slug}`;
    if (type === 'quoc-gia') return `${t('list.country')}: ${slug}`;
    if (type === 'nam') return `${t('list.year')}: ${slug}`;
    return 'List';
  };

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        let res;
        if (location.pathname.includes('/trending')) {
          res = await movieService.getNewUpdates(page);
        } else if (location.pathname.includes('/movies')) {
          res = await movieService.getByCategory('phim-le', page);
        } else if (location.pathname.includes('/tv')) {
          res = await movieService.getByCategory('phim-bo', page);
        } else if (type === 'the-loai' && slug) {
          res = await movieService.getByGenre(slug, page);
        } else if (type === 'quoc-gia' && slug) {
          res = await movieService.getByCountry(slug, page);
        } else if (type === 'nam' && slug) {
          res = await movieService.getByYear(slug, page);
        }

        if (res) {
          setMovies(res.items);
          setPaginate(res.paginate);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
    window.scrollTo(0, 0);
  }, [type, slug, page, location.pathname]);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic">
          <span className="text-brand mr-2">/</span> {getTitle()}
        </h1>
      </div>

      <div className="movie-grid">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
        ) : (
          movies.map((movie, idx) => (
            <MovieCard key={movie.slug} movie={movie} index={idx} />
          ))
        )}
      </div>

      {!loading && paginate && paginate.total_page > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-2 rounded-full bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-brand transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="font-bold text-sm">
            {t('list.page')} {page} / {paginate.total_page}
          </span>
          <button
            disabled={page === paginate.total_page}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-full bg-white/5 border border-white/10 disabled:opacity-20 hover:bg-brand transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}

