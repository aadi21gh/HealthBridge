import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/healthbridge.js';
import api, { setAccessToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount via refresh
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res.data?.data?.accessToken) {
          setAccessToken(res.data.data.accessToken);
          const me = await authService.getMe();
          setUser(me);
        }
      } catch {
        // No valid session — user must log in
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isPatient: user?.role === 'PATIENT',
    isDoctor: user?.role === 'DOCTOR',
    isHospitalAdmin: user?.role === 'HOSPITAL_ADMIN',
    isAdmin: user?.role === 'SYSTEM_ADMIN',
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
