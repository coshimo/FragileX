import { URL_API } from '../config/api';

export const loginApi = async (usuario: string, senha: string) => {
  const response = await fetch(`${URL_API}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ usuario, senha }),
  });

  if (!response.ok) {
    throw new Error('Falha no login. Verifique suas credenciais.');
  }

  return response.json(); // { token, user }
};
