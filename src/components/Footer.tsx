import { Link } from 'react-router-dom';
import { Film, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-light border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Film className="w-8 h-8 text-brand" />
              <span className="text-2xl font-bold tracking-tighter text-white">CINE<span className="text-brand">STREAM</span></span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Trải nghiệm xem phim chất lượng cao hoàn toàn miễn phí. 
              Dữ liệu được cung cấp bởi TMDB API.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-brand transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-brand transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/5 rounded-full hover:bg-brand transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Khám phá</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-brand transition-colors">Trang chủ</Link></li>
              <li><Link to="/movies" className="hover:text-brand transition-colors">Phim lẻ</Link></li>
              <li><Link to="/tv" className="hover:text-brand transition-colors">Phim bộ</Link></li>
              <li><Link to="/trending" className="hover:text-brand transition-colors">Thịnh hành</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-brand transition-colors">Điều khoản</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Bảo mật</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Liên hệ</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/5 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} CineStream. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
