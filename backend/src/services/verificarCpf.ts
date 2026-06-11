import { db } from "../config/database";

export const verificarCpf = async (cpf: string): Promise<boolean> => {
  try {
    const query = "SELECT id FROM usuarios WHERE cpf = $1";
    const resultado = await db.query(query, [cpf]);
    if (resultado.rowCount === null || resultado.rowCount <= 0) return false;
    return true;
  } catch (error) {
    console.error("Erro ao verificar CPF:", error);
    throw new Error("Erro ao verificar CPF");
  }
};
