import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '@/src/services/movieService';
import { Movie } from '@/src/types/movie';
import MovieCard, { MovieCardSkeleton } from '@/src/components/MovieCard';
import ErrorState from '@/src/components/ErrorState';
import { Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Search() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.search(query);
      setResults(res.items);
    } catch (err) {
      console.error(err);
      setError("Không thể tìm kiếm phim lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [query]);

  if (error && results.length === 0) {
    return (
      <ErrorState 
        title="Lỗi tìm kiếm" 
        message={error} 
        onRetry={performSearch} 
      />
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <SearchIcon className="w-6 h-6 text-brand" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('search.results_for')}: <span className="text-brand">"{query}"</span>
        </h1>
      </div>

      <div className="movie-grid">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)
        ) : results.length > 0 ? (
          results.map((movie, idx) => (
            <MovieCard key={movie.slug} movie={movie} index={idx} />
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center">
            <p className="text-xl text-gray-400">{t('search.no_results')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('search.try_another')}</p>
          </div>
        )}
      </div>
    </div>
  );
}


