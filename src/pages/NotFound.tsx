import React from 'react';
import ErrorState from '@/src/components/ErrorState';

export default function NotFound() {
  return (
    <div className="pt-24 pb-20 min-h-screen">
      <ErrorState 
        title="404 - Không tìm thấy trang" 
        message="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa." 
        showHomeButton={true}
      />
    </div>
  );
}
