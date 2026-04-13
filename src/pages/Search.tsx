import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '@/src/services/movieService';
import { Movie } from '@/src/types/movie';
import MovieCard from '@/src/components/MovieCard';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Search() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await movieService.search(query);
        setResults(res.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <SearchIcon className="w-6 h-6 text-brand" />
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('search.results_for')}: <span className="text-brand">"{query}"</span>
        </h1>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="movie-grid">
          {results.map((movie, idx) => (
            <MovieCard key={movie.slug} movie={movie} index={idx} />
          ))}
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <p className="text-xl text-gray-400">{t('search.no_results')}</p>
          <p className="text-sm text-gray-500 mt-2">{t('search.try_another')}</p>
        </div>
      )}
    </div>
  );
}


