import { Request, Response } from "express";
import { db } from "../config/database";

export const criarConsulta = async (req: Request, res: Response) => {
  const idMedico = (req.session as any).userId;
  const role = (req.session as any).role;

  if (role !== "medico" && role !== "instituto") {
    res.status(403).json({ error: "Apenas médicos podem registrar consultas" });
    return;
  }

  const { idPaciente, observacoes, idChecklist } = req.body;

  if (!idPaciente) {
    res.status(400).json({ error: "ID do paciente é obrigatório" });
    return;
  }

  try {
    const query = `INSERT INTO consultas (id_paciente, id_medico, observacoes, id_checklist)
                   VALUES ($1, $2, $3, $4) RETURNING *`;
    const valores = [idPaciente, idMedico, observacoes || null, idChecklist || null];
    const resultado = await db.query(query, valores);

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const fetchConsultasPaciente = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `SELECT c.id, c.data_consulta, c.observacoes, c.id_checklist,
                          u.nome AS nome_medico
                   FROM consultas c
                   JOIN usuarios u ON c.id_medico = u.id
                   WHERE c.id_paciente = $1
                   ORDER BY c.data_consulta DESC`;
    const resultado = await db.query(query, [id]);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Erro ao buscar consultas:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};
