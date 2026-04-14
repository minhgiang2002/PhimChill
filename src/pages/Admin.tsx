import { useEffect, useState } from 'react';
import { collection, query, getDocs, limit, orderBy, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/lib/AuthContext';
import { Users, Shield, Activity, Loader2, AlertTriangle, Database, Globe, Code, Save, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { getApiSource, setApiSource, ApiSource } from '@/src/services/movieService';
import toast from 'react-hot-toast';

interface UserStats {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: any;
}

export default function AdminPage() {
  const { profile, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiSource, setApiSourceState] = useState<ApiSource>(getApiSource());
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'configs', 'appearance');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setCustomCss(configSnap.data().customCss || '');
          setCustomJs(configSnap.data().customJs || '');
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserStats[];
        setUsers(items);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
    fetchUsers();
  }, [isAdmin]);

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!window.confirm(`Bạn có chắc chắn muốn chuyển vai trò của người dùng này thành ${newRole.toUpperCase()}?`)) {
      return;
    }

    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast.success(`Đã cập nhật vai trò thành ${newRole.toUpperCase()}`);
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error('Lỗi khi cập nhật vai trò');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userEmail === 'minhgiang@pavietnam.vn') {
      toast.error('Không thể xóa tài khoản Admin chính!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${userEmail}? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.uid !== userId));
      toast.success('Đã xóa người dùng thành công');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const configRef = doc(db, 'configs', 'appearance');
      await setDoc(configRef, {
        customCss,
        customJs
      }, { merge: true });
      toast.success('Đã lưu cấu hình CSS/JS!');
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error('Lỗi khi lưu cấu hình');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleApiSourceChange = (source: ApiSource) => {
    setApiSource(source);
    setApiSourceState(source);
    let sourceName = 'Nguồn 1';
    if (source === 'kkphim') sourceName = 'Nguồn 2';
    if (source === 'phimapi_delta') sourceName = 'Nguồn 3 (Delta)';
    toast.success(`Đã chuyển nguồn API sang: ${sourceName}`);
    // Reload to apply changes
    setTimeout(() => window.location.reload(), 1000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className="p-2 sm:p-3 bg-brand/20 rounded-xl sm:rounded-2xl">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-brand" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tighter uppercase italic">Admin Dashboard</h1>
          <p className="text-gray-500 text-[10px] sm:text-sm font-bold uppercase tracking-widest">Quản lý hệ thống và người dùng</p>
        </div>
      </div>

      {/* API Settings Section */}
      <div className="bg-surface-light p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl mb-8 sm:mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
          <h2 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic">Cấu hình Nguồn API</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => handleApiSourceChange('nguonc')}
            className={cn(
              "flex flex-col items-start p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all text-left",
              apiSource === 'nguonc' 
                ? "bg-brand/10 border-brand shadow-lg shadow-brand/10" 
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
              <span className="text-base sm:text-lg font-black tracking-tighter uppercase italic">Nguồn 1 (NguonC)</span>
              {apiSource === 'nguonc' && <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Nguồn phim mặc định, ổn định cao.</p>
          </button>

          <button
            onClick={() => handleApiSourceChange('kkphim')}
            className={cn(
              "flex flex-col items-start p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all text-left",
              apiSource === 'kkphim' 
                ? "bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/10" 
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
              <span className="text-base sm:text-lg font-black tracking-tighter uppercase italic">Nguồn 2 (KKPhim)</span>
              {apiSource === 'kkphim' && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Nguồn phim phong phú, hỗ trợ ảnh WebP.</p>
          </button>

          <button
            onClick={() => handleApiSourceChange('phimapi_delta')}
            className={cn(
              "flex flex-col items-start p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all text-left",
              apiSource === 'phimapi_delta' 
                ? "bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10" 
                : "bg-white/5 border-white/10 hover:border-white/20"
            )}
          >
            <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
              <span className="text-base sm:text-lg font-black tracking-tighter uppercase italic">Nguồn 3 (Delta)</span>
              {apiSource === 'phimapi_delta' && <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />}
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Nguồn tổng hợp từ nhiều API khác nhau.</p>
          </button>
        </div>
        <p className="mt-4 text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
          <Globe className="w-3 h-3" />
          Lưu ý: Thay đổi nguồn API sẽ ảnh hưởng đến danh sách phim hiển thị ngoài trang chủ.
        </p>
      </div>

      {/* Custom CSS/JS Section */}
      <div className="bg-surface-light p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
            <h2 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic">Tùy chỉnh CSS & JS</h2>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={isSavingConfig}
            className="flex items-center gap-2 bg-brand hover:bg-brand/90 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isSavingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu thay đổi
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Custom CSS</label>
            <textarea
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder="/* Nhập CSS của bạn tại đây... */"
              className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-brand transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Custom JS</label>
            <textarea
              value={customJs}
              onChange={(e) => setCustomJs(e.target.value)}
              placeholder="// Nhập JavaScript của bạn tại đây..."
              className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-brand transition-all resize-none"
            />
          </div>
        </div>
        <p className="mt-4 text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Lưu ý: Code sẽ được thực thi ngay lập tức trên toàn trang sau khi lưu.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div className="bg-surface-light p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
            <span className="text-[8px] sm:text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-2 py-1 rounded">Total Users</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">{users.length}</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Người dùng đã đăng ký</p>
        </div>
        
        <div className="bg-surface-light p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            <span className="text-[8px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-1 rounded">System Status</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">Active</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Hệ thống đang hoạt động ổn định</p>
        </div>

        <div className="bg-surface-light p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl sm:col-span-2 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="text-[8px] sm:text-[10px] font-black text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2 py-1 rounded">Reports</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">0</div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2">Không có báo cáo lỗi nào</p>
        </div>
      </div>

      <div className="bg-surface-light rounded-2xl sm:rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-white/5">
          <h2 className="text-lg sm:text-xl font-bold text-white">Danh sách người dùng mới</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand">
                        {u.displayName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-bold text-white">{u.displayName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleUpdateRole(u.uid, u.role)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all hover:scale-105",
                        u.role === 'admin' ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-gray-400/10 text-gray-400 hover:bg-gray-400/20"
                      )}
                    >
                      {u.role === 'admin' ? 'ADMIN' : 'USER'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {u.createdAt?.toDate().toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.uid, u.email)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Xóa người dùng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
