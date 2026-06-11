import { Request, Response } from "express";
import { db } from "../config/database";

export const fetchPacientes = async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const role = (req.session as any).role;

  try {
    let query: string;
    let valores: any[];

    if (role === "instituto") {
      query = `SELECT u.id, u.nome, u.email, u.telefone,
                      p.data_nascimento, p.sexo_biologico, p.genero, p.sindrome, p.id_medico_responsavel,
                      EXTRACT(YEAR FROM AGE(p.data_nascimento)) AS idade
               FROM usuarios u
               JOIN pacientes p ON u.id = p.id_usuario
               ORDER BY u.nome`;
      valores = [];
    } else {
      // medico: only their patients
      query = `SELECT u.id, u.nome, u.email, u.telefone,
                      p.data_nascimento, p.sexo_biologico, p.genero, p.sindrome, p.id_medico_responsavel,
                      EXTRACT(YEAR FROM AGE(p.data_nascimento)) AS idade
               FROM usuarios u
               JOIN pacientes p ON u.id = p.id_usuario
               WHERE p.id_medico_responsavel = $1
               ORDER BY u.nome`;
      valores = [userId];
    }

    const resultado = await db.query(query, valores);
    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao listar pacientes:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const fetchPacienteById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `SELECT u.id, u.nome, u.email, u.telefone,
                          p.data_nascimento, p.sexo_biologico, p.genero, p.sindrome, p.id_medico_responsavel,
                          EXTRACT(YEAR FROM AGE(p.data_nascimento)) AS idade
                   FROM usuarios u
                   JOIN pacientes p ON u.id = p.id_usuario
                   WHERE u.id = $1`;
    const resultado = await db.query(query, [id]);

    if (resultado.rowCount === null || resultado.rowCount <= 0) {
      res.status(404).json({ error: "Paciente não encontrado" });
      return;
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar paciente:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};
