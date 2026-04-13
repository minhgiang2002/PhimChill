import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import toast from 'react-hot-toast';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading if Firebase hangs
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("AuthContext: Safety timeout reached. Forcing loading to false.");
        setLoading(false);
      }
    }, 3000); // Reduced to 3s for faster recovery

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      try {
        if (firebaseUser) {
          // Get or create user profile in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'minhgiang@pavietnam.vn' ? 'admin' : 'user',
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth profile fetch error:", error);
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    }, (error) => {
      console.error("onAuthStateChanged error:", error);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async () => {
    if (loading) return;
    const toastId = toast.loading('Đang đăng nhập...');
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Đăng nhập thành công!', { id: toastId });
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request') {
        toast.dismiss(toastId);
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Cửa sổ đăng nhập đã bị đóng.', { id: toastId });
      } else {
        toast.error('Đăng nhập thất bại. Vui lòng thử lại.', { id: toastId });
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Đã đăng xuất.');
    } catch (error) {
      toast.error('Đăng xuất thất bại.');
    }
  };

  const isAdmin = profile?.role === 'admin' || user?.email === 'minhkhung72@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
