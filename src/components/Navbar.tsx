import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, Menu, X, ChevronDown, Globe, Loader2, LogIn, LogOut, User, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useTranslation } from 'react-i18next';
import { movieService } from '@/src/services/movieService';
import { Movie } from '@/src/types/movie';
import { useAuth } from '@/src/lib/AuthContext';
import SafeImage from './SafeImage';

const GENRES = [
  { name: 'Hành động', slug: 'hanh-dong', en: 'Action' },
  { name: 'Cổ trang', slug: 'co-trang', en: 'Historical' },
  { name: 'Chiến tranh', slug: 'chien-tranh', en: 'War' },
  { name: 'Viễn tưởng', slug: 'vien-tuong', en: 'Sci-Fi' },
  { name: 'Kinh dị', slug: 'kinh-di', en: 'Horror' },
  { name: 'Hài hước', slug: 'hai-huoc', en: 'Comedy' },
];

const COUNTRIES = [
  { name: 'Trung Quốc', slug: 'trung-quoc', en: 'China' },
  { name: 'Hàn Quốc', slug: 'han-quoc', en: 'Korea' },
  { name: 'Nhật Bản', slug: 'nhat-ban', en: 'Japan' },
  { name: 'Âu Mỹ', slug: 'au-my', en: 'Western' },
  { name: 'Thái Lan', slug: 'thai-lan', en: 'Thailand' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, profile, login, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const response = await movieService.search(searchQuery);
          setSearchResults(response.items.slice(0, 6)); // Show top 6 results
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchResults([]);
      setIsMenuOpen(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLang);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <Film className="w-6 h-6 sm:w-8 sm:h-8 text-brand group-hover:scale-110 transition-transform" />
              <span className="text-lg sm:text-2xl font-black tracking-tighter text-white uppercase">CINE<span className="text-brand">STREAM</span></span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">{t('nav.home')}</Link>
              <Link to="/movies" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">{t('nav.movies')}</Link>
              <Link to="/tv" className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">{t('nav.tv_series')}</Link>
              
              <div className="relative group" onMouseEnter={() => setActiveDropdown('genre')} onMouseLeave={() => setActiveDropdown(null)}>
                <button className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                  {t('nav.genres')} <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="bg-surface-light border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-x-8 gap-y-2 w-64 shadow-2xl">
                    {GENRES.map(g => (
                      <Link key={g.slug} to={`/list/the-loai/${g.slug}`} className="text-sm text-gray-400 hover:text-brand transition-colors whitespace-nowrap">
                        {i18n.language === 'vi' ? g.name : g.en}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative group" onMouseEnter={() => setActiveDropdown('country')} onMouseLeave={() => setActiveDropdown(null)}>
                <button className="flex items-center gap-1 text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                  {t('nav.countries')} <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="bg-surface-light border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-x-8 gap-y-2 w-64 shadow-2xl">
                    {COUNTRIES.map(c => (
                      <Link key={c.slug} to={`/list/quoc-gia/${c.slug}`} className="text-sm text-gray-400 hover:text-brand transition-colors whitespace-nowrap">
                        {i18n.language === 'vi' ? c.name : c.en}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* Desktop Search */}
            <div className="relative w-full max-w-[180px] sm:max-w-xs hidden sm:block" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                className="relative"
              >
                <input
                  type="text"
                  placeholder={t('nav.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-full py-1.5 pl-4 pr-10 text-xs sm:text-sm focus:outline-none focus:border-brand focus:bg-white/15 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isSearching && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-surface-light border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-2">
                      {searchResults.map((movie) => (
                        <Link
                          key={movie.slug}
                          to={`/movie/${movie.slug}`}
                          onClick={() => {
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors group"
                        >
                          <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden">
                            <SafeImage
                              src={movie.thumb_url}
                              alt={movie.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors">
                              {movie.name}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">
                              {movie.original_name} ({movie.year})
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button
                      onClick={handleSearch}
                      className="w-full p-3 text-xs font-bold text-center bg-white/5 hover:bg-white/10 transition-colors uppercase tracking-widest border-t border-white/5"
                    >
                      Xem tất cả kết quả
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="sm:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-gray-400" />
            </button>

            <button 
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 hover:bg-white/10 rounded-full transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <Globe className="w-4 h-4" />
              {i18n.language}
            </button>

            {/* Auth Button / User Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
                >
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                  <span className="hidden sm:block text-xs font-bold text-white truncate max-w-[100px]">
                    {user.displayName}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isUserMenuOpen && "rotate-180")} />
                </button>
              ) : (
                <button 
                  onClick={login}
                  className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-brand/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </button>
              )}

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-56 bg-surface-light border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-xs font-bold text-white truncate">{user?.displayName}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-2 text-[8px] font-black text-brand uppercase tracking-widest bg-brand/10 px-2 py-0.5 rounded">
                          Administrator
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <Link 
                        to="/history" 
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 p-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <History className="w-4 h-4" />
                        Lịch sử xem phim
                      </Link>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 p-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4" />
                          Quản lý (Admin)
                        </Link>
                      )}
                      <button 
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Overlay */}
      <AnimatePresence>
        {isSearchVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 bg-surface-light border-b border-white/10 p-4 sm:hidden z-40 shadow-2xl"
          >
            <form onSubmit={handleSearch} className="relative">
              <input
                autoFocus
                type="text"
                placeholder={t('nav.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 text-base focus:outline-none focus:border-brand"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-surface border-b border-white/10 px-4 py-6 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest">{t('nav.home')}</Link>
                <Link to="/movies" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest">{t('nav.movies')}</Link>
                <Link to="/tv" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest">{t('nav.tv_series')}</Link>
                {user && (
                  <Link to="/history" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase tracking-widest">Lịch sử</Link>
                )}
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">{t('nav.genres')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {GENRES.map(g => (
                    <Link key={g.slug} to={`/list/the-loai/${g.slug}`} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-300">
                      {i18n.language === 'vi' ? g.name : g.en}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">{t('nav.countries')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {COUNTRIES.map(c => (
                    <Link key={c.slug} to={`/list/quoc-gia/${c.slug}`} onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-gray-300">
                      {i18n.language === 'vi' ? c.name : c.en}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}


