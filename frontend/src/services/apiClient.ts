import { URL_API } from '../config/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('@App:token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${URL_API}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Opcional: Aqui você pode disparar um evento global para fazer logout
      // se o token expirou.
      localStorage.removeItem('@App:token');
      localStorage.removeItem('@App:user');
      window.location.href = '/login';
    }
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
};
