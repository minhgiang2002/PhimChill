import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
}

export default function ErrorState({ 
  title = "Đã có lỗi xảy ra", 
  message = "Không thể tải dữ liệu lúc này. Vui lòng thử lại sau.", 
  onRetry,
  showHomeButton = true
}: ErrorStateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface-light border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-brand to-orange-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-black tracking-tighter uppercase italic mb-3 text-white">
            {title}
          </h2>
          
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRetry && (
              <button 
                onClick={onRetry}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand hover:bg-brand/90 text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-brand/20"
              >
                <RefreshCcw className="w-4 h-4" />
                Thử lại
              </button>
            )}
            
            {showHomeButton && (
              <Link 
                to="/"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all border border-white/10"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
