import { Request, Response } from 'express';
import { logarUsuario } from '../services/logarUsuario';

export const login = async (req: Request, res: Response) => {
    try {
        const { usuario, senha } = req.body;

        if (!usuario || !senha) {
            res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
            return;
        }

        const authResult = await logarUsuario(usuario, senha);

        if (authResult) {
            res.status(200).json(authResult);
        } else {
            res.status(401).json({ error: 'Credenciais inválidas' });
        }
    } catch (error) {
        console.error('Erro no controller de login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
