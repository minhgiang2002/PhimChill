import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  vi: {
    translation: {
      "nav": {
        "home": "Trang chủ",
        "movies": "Phim lẻ",
        "tv_series": "Phim bộ",
        "genres": "Thể loại",
        "countries": "Quốc gia",
        "search_placeholder": "Tìm kiếm phim...",
        "trending": "Phim mới cập nhật"
      },
      "home": {
        "new_updates": "Phim mới cập nhật",
        "latest_movies": "Phim lẻ mới nhất",
        "latest_tv": "Phim bộ mới nhất",
        "view_all": "Xem tất cả",
        "error_loading": "Không thể tải dữ liệu từ máy chủ.",
        "error_sub": "Vui lòng thử lại sau hoặc kiểm tra kết nối mạng."
      },
      "detail": {
        "watch_now": "Xem ngay",
        "episodes": "Danh sách tập phim",
        "content": "Nội dung phim",
        "info": "Thông tin chi tiết",
        "director": "Đạo diễn",
        "casts": "Diễn viên",
        "language": "Ngôn ngữ",
        "quality": "Chất lượng",
        "not_found": "Không tìm thấy phim này.",
        "watching": "Đang xem",
        "episode": "Tập",
        "player_note": "Sử dụng trình phát tối ưu (HLS). Nếu không tải được, hãy thử đổi Server hoặc tải lại trang.",
        "server": "Server",
        "switch_player": "Đổi trình phát",
        "player_error": "Link HLS từ nhà cung cấp đang bị lỗi (DNS/CORS), hệ thống đã tự động chuyển sang trình phát dự phòng để bạn có thể xem phim ngay."
      },
      "search": {
        "results_for": "Kết quả tìm kiếm cho",
        "no_results": "Không tìm thấy kết quả nào phù hợp.",
        "try_another": "Hãy thử tìm kiếm với từ khóa khác."
      },
      "list": {
        "genre": "Thể loại",
        "country": "Quốc gia",
        "year": "Năm phát hành",
        "page": "Trang"
      },
      "common": {
        "loading": "Đang tải...",
        "error": "Đã xảy ra lỗi"
      }
    }
  },
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "movies": "Movies",
        "tv_series": "TV Series",
        "genres": "Genres",
        "countries": "Countries",
        "search_placeholder": "Search movies...",
        "trending": "New Updates"
      },
      "home": {
        "new_updates": "New Updates",
        "latest_movies": "Latest Movies",
        "latest_tv": "Latest TV Series",
        "view_all": "View All",
        "error_loading": "Could not load data from server.",
        "error_sub": "Please try again later or check your connection."
      },
      "detail": {
        "watch_now": "Watch Now",
        "episodes": "Episode List",
        "content": "Overview",
        "info": "Details",
        "director": "Director",
        "casts": "Casts",
        "language": "Language",
        "quality": "Quality",
        "not_found": "Movie not found.",
        "watching": "Watching",
        "episode": "Episode",
        "player_note": "Using optimized player (HLS). If it doesn't load, try switching servers or refresh.",
        "server": "Server",
        "switch_player": "Switch Player",
        "player_error": "The HLS link from the provider is currently down (DNS/CORS). We've automatically switched to the backup player so you can watch immediately."
      },
      "search": {
        "results_for": "Search results for",
        "no_results": "No results found.",
        "try_another": "Try searching with another keyword."
      },
      "list": {
        "genre": "Genre",
        "country": "Country",
        "year": "Release Year",
        "page": "Page"
      },
      "common": {
        "loading": "Loading...",
        "error": "An error occurred"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
