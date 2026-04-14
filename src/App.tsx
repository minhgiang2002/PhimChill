import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { Toaster } from 'react-hot-toast';
import CustomCodeInjector from './components/CustomCodeInjector';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import Search from './pages/Search';
import MovieList from './pages/MovieList';
import History from './pages/History';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import './i18n'; // Import i18n configuration

import AIChatBox from './components/AIChatBox';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <CustomCodeInjector />
      <Router>
        <div className="min-h-screen bg-surface text-white flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/search" element={<Search />} />
              <Route path="/trending" element={<MovieList />} />
              <Route path="/movies" element={<MovieList />} />
              <Route path="/tv" element={<MovieList />} />
              <Route path="/history" element={<History />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/list/:type/:slug" element={<MovieList />} />
              {/* Fallback for other routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <AIChatBox />
        </div>
      </Router>
    </AuthProvider>
  );
}



