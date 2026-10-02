import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, FacultyProfile } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | FacultyProfile | null;
  token: string | null;
  isLoading: boolean;
  unverifiedError: string | null;
  login: (email: string, password: string, role?: 'student' | 'faculty' | 'admin') => Promise<User>;
  logout: () => void;
  registerStudent: (data: any) => Promise<any>;
  registerFaculty: (data: any) => Promise<any>;
  switchDemoRole: (role: 'student' | 'faculty' | 'admin') => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | FacultyProfile | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [unverifiedError, setUnverifiedError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
        setProfile(data.profile || null);
      } catch (err) {
        console.warn('Failed to restore session:', err);
        removeStoredToken();
        setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string, role?: 'student' | 'faculty' | 'admin'): Promise<User> => {
    setUnverifiedError(null);
    try {
      const data = await api.login(email, password, role);
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile || null);
      return data.user;
    } catch (err: any) {
      if (err.message && (err.message.includes('awaiting college verification') || err.message.includes('awaiting institutional verification') || err.message.includes('suspended') || err.message.includes('declined'))) {
        setUnverifiedError(err.message);
      }
      throw err;
    }
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setProfile(null);
    setUnverifiedError(null);
  };

  const registerStudent = async (data: any) => {
    return await api.registerStudent(data);
  };

  const registerFaculty = async (data: any) => {
    return await api.registerFaculty(data);
  };

  const switchDemoRole = async (role: 'student' | 'faculty' | 'admin') => {
    setIsLoading(true);
    setUnverifiedError(null);
    try {
      const data = await api.demoSwitch(role);
      setStoredToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setProfile(data.profile || null);
    } catch (err) {
      console.error('Failed to switch demo role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile || null);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const clearError = () => {
    setUnverifiedError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        unverifiedError,
        login,
        logout,
        registerStudent,
        registerFaculty,
        switchDemoRole,
        refreshProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
