import { db } from "../config/database";

export type Role = "instituto" | "medico" | "paciente";

export const detectarRole = async (userId: number): Promise<Role | null> => {
  try {
    // Priority: instituto > medico > paciente
    const instituto = await db.query("SELECT id_usuario FROM funcionarios_ibk WHERE id_usuario = $1", [userId]);
    if (instituto.rowCount && instituto.rowCount > 0) return "instituto";

    const medico = await db.query("SELECT id_usuario FROM medicos WHERE id_usuario = $1", [userId]);
    if (medico.rowCount && medico.rowCount > 0) return "medico";

    const paciente = await db.query("SELECT id_usuario FROM pacientes WHERE id_usuario = $1", [userId]);
    if (paciente.rowCount && paciente.rowCount > 0) return "paciente";

    return null;
  } catch (error) {
    console.error("Erro ao detectar role:", error);
    throw new Error("Erro ao detectar role");
  }
};
