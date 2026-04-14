import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/lib/AuthContext';
import { History as HistoryIcon, Play, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SafeImage from '@/src/components/SafeImage';
import { doc, deleteDoc } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  movieSlug: string;
  movieName: string;
  movieThumb: string;
  episodeName: string;
  updatedAt: any;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const historyRef = collection(db, 'users', user.uid, 'history');
    // Remove orderBy from query to avoid index issues if any, we can sort locally
    const q = query(historyRef);

    // Safety timeout
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeoutId);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      
      // Sort locally by updatedAt desc
      items.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis?.() || 0;
        const timeB = b.updatedAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setHistory(items);
      setLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.error("Error fetching history:", error);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [user]);

  const removeHistoryItem = async (movieId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'history', movieId));
    } catch (error) {
      console.error("Error removing history item:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <HistoryIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-gray-400 text-center max-w-md">
          Bạn cần đăng nhập để xem lại lịch sử các phim đã xem.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-brand" />
          LỊCH SỬ XEM PHIM
        </h1>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {history.length} phim đã xem
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <Play className="w-12 h-12 text-gray-600 mb-4 opacity-20" />
          <p className="text-gray-400 font-medium">Bạn chưa xem bộ phim nào.</p>
          <Link to="/" className="mt-4 text-brand font-bold hover:underline">Khám phá phim ngay</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {history.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-surface-light rounded-2xl overflow-hidden border border-white/5 hover:border-brand/50 transition-all shadow-xl"
              >
                <Link to={`/movie/${item.movieSlug}`} className="block aspect-[16/9] relative overflow-hidden">
                  <SafeImage
                    src={item.movieThumb}
                    alt={item.movieName}
                    movieSlug={item.movieSlug}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link to={`/movie/${item.movieSlug}`}>
                        <h3 className="text-sm font-bold text-white truncate hover:text-brand transition-colors">
                          {item.movieName}
                        </h3>
                      </Link>
                      <p className="text-xs text-brand font-medium mt-1">
                        Đang xem: Tập {item.episodeName}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                        {item.updatedAt?.toDate().toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeHistoryItem(item.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Xóa khỏi lịch sử"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
