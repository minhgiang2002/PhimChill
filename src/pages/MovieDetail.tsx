import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { movieService } from '@/src/services/movieService';
import { MovieDetails, Episode } from '@/src/types/movie';
import { Star, Clock, List, Info, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { SafeImage } from '@/src/components/SafeImage';
import ErrorState from '@/src/components/ErrorState';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/src/lib/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import toast from 'react-hot-toast';

export default function MovieDetail() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { id: slug } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showIframeOverlay, setShowIframeOverlay] = useState(false);

  useEffect(() => {
    if (currentEpisode && !currentEpisode.embed) {
      setShowIframeOverlay(true);
      const timer = setTimeout(() => setShowIframeOverlay(false), 5000);
      return () => clearTimeout(timer);
    }

    // Save history if user is logged in
    if (user && movie && currentEpisode) {
      const saveHistory = async () => {
        try {
          const historyRef = doc(db, 'users', user.uid, 'history', movie.slug);
          await setDoc(historyRef, {
            userId: user.uid,
            movieSlug: movie.slug,
            movieName: movie.name || '',
            movieThumb: movie.thumb_url || movie.poster_url || '',
            episodeName: currentEpisode.name || '',
            episodeSlug: currentEpisode.slug || '',
            updatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (error) {
          console.error("Error saving history:", error);
        }
      };
      saveHistory();
    }
  }, [currentEpisode, user, movie]);

  const loadMovie = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getMovieDetail(slug);
      setMovie(res.movie);
      setActiveServerIndex(0); // Reset to first server when movie changes
    } catch (err) {
      console.error(err);
      setError("Không tìm thấy phim hoặc có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovie();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <ErrorState 
        title="Không tìm thấy phim" 
        message={error || t('detail.not_found')} 
        onRetry={loadMovie} 
      />
    );
  }

  const handlePlay = (episode: Episode) => {
    setCurrentEpisode(episode);
    const playerSection = document.getElementById('player-section');
    if (playerSection) {
      playerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={cn("pb-20 transition-colors duration-500", isCinemaMode ? "bg-black" : "")}>
      {/* Cinema Mode Overlay */}
      <AnimatePresence>
        {isCinemaMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Backdrop & Info */}
      <div className="relative min-h-[70vh] flex items-end pb-12">
        <div className="absolute inset-0">
          <SafeImage
            src={movie.poster_url}
            secondarySrc={movie.thumb_url}
            movieSlug={movie.slug}
            alt={movie.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden md:block w-64 shrink-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10"
            >
              <SafeImage
                src={movie.thumb_url}
                secondarySrc={movie.poster_url}
                movieSlug={movie.slug}
                alt={movie.name}
                className="w-full h-auto"
              />
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4">
                {Object.values(movie.category).map((cat: any) => 
                  cat.list.map((item: any) => (
                    <span key={item.id} className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1 rounded-full border border-white/10 text-gray-300">
                      {item.name}
                    </span>
                  ))
                )}
              </div>
              
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-1 sm:mb-2 text-white leading-tight">
                {movie.name}
              </h1>
              <h2 className="text-base sm:text-xl md:text-2xl font-medium text-gray-400 mb-4 sm:mb-6 tracking-tight">
                {movie.original_name}
              </h2>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-300 mb-6 sm:mb-8">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-brand fill-brand" />
                  <span className="font-bold text-white">{movie.quality}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{movie.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <List className="w-4 h-4" />
                  <span>{movie.current_episode} / {movie.total_episodes} {t('detail.episode')}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {movie.episodes.length > 0 && movie.episodes[0].items.length > 0 && (
                  <button
                    onClick={() => handlePlay(movie.episodes[0].items[0])}
                    className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-10 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-brand/20"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    {t('detail.watch_now')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Section */}
      <AnimatePresence>
        {currentEpisode && (
          <motion.div 
            id="player-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 overflow-hidden"
          >
            <div className={cn(
              "aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl relative transition-all duration-500",
              isCinemaMode ? "z-50 scale-105" : "z-0"
            )}>
              <div className="relative w-full h-full">
                <iframe
                  src={currentEpisode.embed}
                  className="w-full h-full"
                  allowFullScreen
                  frameBorder="0"
                  scrolling="no"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-top-navigation"
                  allow="autoplay; fullscreen; picture-in-picture"
                />
                {showIframeOverlay && (
                  <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-brand animate-spin mb-2" />
                    <p className="text-xs text-gray-400">{t('common.loading')}</p>
                    <p className="text-[10px] text-gray-600 mt-2">Đang tối ưu trình phát...</p>
                  </div>
                )}
              </div>
            </div>
            <div className={cn(
              "mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-500",
              isCinemaMode ? "z-50 relative bg-black/80 backdrop-blur-md" : ""
            )}>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{t('detail.watching')}: {movie.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-brand font-medium">{t('detail.episode')} {currentEpisode.name}</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter italic">
                      {movie.episodes[activeServerIndex].server_name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={() => setIsCinemaMode(!isCinemaMode)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-lg border transition-colors font-bold flex items-center gap-2",
                    isCinemaMode 
                      ? "bg-brand border-brand text-white" 
                      : "bg-white/10 border-white/10 text-gray-300 hover:bg-white/20"
                  )}
                >
                  🎬 {isCinemaMode ? "Tắt rạp phim" : "Chế độ rạp phim"}
                </button>
                <div className="text-[10px] text-gray-500 max-w-xs text-right hidden sm:block">
                  {t('detail.player_note')}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Episodes & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Episode List */}
            {movie.episodes.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <List className="w-6 h-6 text-brand" />
                    {t('detail.episodes')}
                  </h2>
                  
                  {movie.episodes.length > 1 && (
                    <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      {movie.episodes.map((server, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveServerIndex(idx);
                            // If an episode is currently playing, try to find it on the new server
                            if (currentEpisode) {
                              const matchingEp = server.items.find(item => item.name === currentEpisode.name);
                              if (matchingEp) {
                                setCurrentEpisode(matchingEp);
                              }
                            }
                          }}
                          className={cn(
                            "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border",
                            activeServerIndex === idx 
                              ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                              : "bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {server.server_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2">
                  {movie.episodes[activeServerIndex].items.map((ep) => {
                    const isNumeric = /^\d+$/.test(ep.name);
                    const displayName = isNumeric ? `Tập ${ep.name}` : ep.name;
                    
                    return (
                      <button
                        key={ep.slug}
                        onClick={() => handlePlay(ep)}
                        className={cn(
                          "aspect-square flex items-center justify-center rounded-lg border font-bold transition-all text-[10px] sm:text-xs text-center p-1 min-h-[40px] sm:min-h-0",
                          currentEpisode?.slug === ep.slug 
                            ? "bg-brand border-brand text-white shadow-lg shadow-brand/20" 
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-brand hover:text-white"
                        )}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-brand" />
                {t('detail.content')}
              </h2>
              <div 
                className="text-gray-400 leading-relaxed text-lg prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: movie.description }}
              />
            </section>
          </div>
          
          <div className="space-y-8">
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-2">{t('detail.info')}</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1 uppercase text-[10px] font-bold tracking-widest">{t('detail.director')}</span>
                  <span className="text-white">{movie.director || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1 uppercase text-[10px] font-bold tracking-widest">{t('detail.casts')}</span>
                  <span className="text-white leading-relaxed">{movie.casts || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1 uppercase text-[10px] font-bold tracking-widest">{t('detail.language')}</span>
                  <span className="text-white">{movie.language}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1 uppercase text-[10px] font-bold tracking-widest">{t('detail.quality')}</span>
                  <span className="text-white">{movie.quality}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}


