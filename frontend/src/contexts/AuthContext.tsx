import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiFetch, setCsrfToken } from '../services/apiFetch';

export type Role = 'medico' | 'instituto' | 'paciente' | null;

export interface Usuario {
  id: number;
  email: string;
  role: Role;
  nome: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (user: Usuario) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch CSRF token first
        const csrfRes = await apiFetch('/csrf-token');
        if (csrfRes.ok) {
          const { csrfToken } = await csrfRes.json();
          setCsrfToken(csrfToken);
        }

        // Check if user is already logged in
        const meRes = await apiFetch('/auth/me');
        if (meRes.ok) {
          const userData = await meRes.json();
          setUsuario(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (user: Usuario) => {
    setUsuario(user);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Failed to logout on server', error);
    } finally {
      setUsuario(null);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
