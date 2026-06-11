import { db } from "../config/database";
import bcrypt from "bcryptjs";

interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
}

export const logarUsuario = async (usuario: string, senha: string): Promise<UsuarioLogado | null> => {
  try {
    const query = "SELECT id, nome, email, cpf, telefone, senha_hash FROM usuarios WHERE email = $1 OR cpf = $1";
    const resultado = await db.query(query, [usuario]);

    if (resultado.rowCount !== null && resultado.rowCount > 0) {
      const row = resultado.rows[0];
      const senhaValida = await bcrypt.compare(senha, row.senha_hash);
      if (senhaValida) {
        return {
          id: row.id,
          nome: row.nome,
          email: row.email,
          cpf: row.cpf,
          telefone: row.telefone,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erro ao logar usuário:", error);
    throw new Error("Erro ao logar usuário");
  }
};