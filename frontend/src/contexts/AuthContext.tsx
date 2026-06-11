import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Role = 'medico' | 'instituto' | 'paciente' | null;

export interface Usuario {
  id: string | number;
  email?: string;
  role?: Role;
  nome?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  login: (usuarioData: Usuario, tokenStr: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Tenta recuperar do localStorage ao carregar a página
    const storedToken = localStorage.getItem('@App:token');
    const storedUser = localStorage.getItem('@App:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const login = (usuarioData: Usuario, tokenStr: string) => {
    setUsuario(usuarioData);
    setToken(tokenStr);
    localStorage.setItem('@App:token', tokenStr);
    localStorage.setItem('@App:user', JSON.stringify(usuarioData));
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('@App:token');
    localStorage.removeItem('@App:user');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
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
