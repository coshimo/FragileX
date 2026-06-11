import {db} from "../config/database"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const logarUsuario = async (usuario: string, senha: string) => {
    try {
        const query = 'SELECT id, senha_hash FROM usuarios WHERE email = $1 OR cpf = $1';
        const valores = [usuario];
        const resultado = await db.query(query, valores);
        if (resultado.rowCount !== null && resultado.rowCount > 0) {
            const usuarioDb = resultado.rows[0];
            const senhaValida = await bcrypt.compare(senha, usuarioDb.senha_hash);
            
            if (senhaValida) {
                const secret = process.env.JWT_SECRET || 'fallback_secret_para_desenvolvimento';
                const token = jwt.sign({ id: usuarioDb.id }, secret, { expiresIn: '1d' });
                return { token, user: { id: usuarioDb.id } };
            }
        } 
        return null;

    } catch (error) {
        console.error('Erro ao logar usuário:', error);
        throw new Error('Erro ao logar usuário');
    }
}