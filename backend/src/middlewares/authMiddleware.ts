import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido' });
        return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        res.status(401).json({ error: 'Erro de formatação do token' });
        return;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        res.status(401).json({ error: 'Token mal formatado' });
        return;
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_para_desenvolvimento';

    jwt.verify(token, secret, (err: any, decoded: any) => {
        if (err) {
            res.status(401).json({ error: 'Token inválido' });
            return;
        }

        req.userId = decoded.id;
        return next();
    });
};
