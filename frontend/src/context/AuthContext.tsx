import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserDto {
  id: number;
  name: string | null;
  email: string | null;
  mobile: string;
  role: 'CUSTOMER' | 'COMPANION' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT' | 'MODERATOR' | 'FINANCE';
  profile_photo: string | null;
  is_18_plus_verified: boolean;
  city_id?: number | null;
  gender?: string | null;
  date_of_birth?: string | null;
}

interface AuthContextType {
  user: UserDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  sendOtp: (mobile: string) => Promise<{ success: boolean; message: string; mockOtp?: string }>;
  verifyOtp: (mobile: string, otp: string, role?: 'CUSTOMER' | 'COMPANION') => Promise<{ success: boolean; isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } catch (e) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const sendOtp = async (mobile: string) => {
    try {
      const res = await api.post('/auth/send-otp', { mobile });
      return {
        success: res.data.success,
        message: res.data.message,
        mockOtp: res.data.data?.mockOtp,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to dispatch OTP. Please try again.',
      };
    }
  };

  const verifyOtp = async (mobile: string, otp: string, role?: 'CUSTOMER' | 'COMPANION') => {
    const res = await api.post('/auth/verify-otp', { mobile, otp, role });
    if (res.data.success) {
      const { accessToken, refreshToken, user: userDto } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userDto);
      return { success: true, isNewUser: res.data.data.isNewUser };
    }
    return { success: false, isNewUser: false };
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        sendOtp,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
