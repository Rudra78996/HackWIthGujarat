import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface JwtPayload {
  id: string;
  exp: number;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/login', { email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ token, user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({ token: null, user: null, isAuthenticated: false });
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }
        
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            get().logout();
            return;
          }
          
          // Token valid, set auth headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch current user data
          api.get('/users/me')
            .then(response => {
              set({ 
                user: response.data, 
                isAuthenticated: true,
                token 
              });
            })
            .catch(() => {
              get().logout();
            });
            
        } catch (error) {
          get().logout();
        }
      },

      updateUser: async (userData) => {
        try {
          set({ isLoading: true });
          const response = await api.put('/users/me', userData);
          set({ user: response.data, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);