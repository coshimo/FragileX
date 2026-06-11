import { Request, Response } from "express";
import { db } from "../config/database";

export const saveChecklist = async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;
  const role = (req.session as any).role;

  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  // We assume the user is a paciente filling their own checklist for now.
  // If it's a doctor, we'd need to receive a pacienteId in the body.
  // For simplicity, we just use the logged-in user if they are a paciente.
  // Or we can get it from body if the doctor is filling it.
  const idPaciente = role === "paciente" ? userId : req.body.idPaciente;

  if (!idPaciente) {
    res.status(400).json({ error: "idPaciente é obrigatório para médicos" });
    return;
  }

  const { sintomas, historico_medico } = req.body;

  if (!sintomas || !Array.isArray(sintomas) || sintomas.length === 0) {
    res.status(400).json({ error: "Sintomas não informados" });
    return;
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 1. Calculate Score
    const pacienteRes = await client.query("SELECT sexo_biologico FROM pacientes WHERE id_usuario = $1", [idPaciente]);
    if (pacienteRes.rowCount === 0) {
      throw new Error("Paciente não encontrado");
    }
    const sexoBiologico = pacienteRes.rows[0].sexo_biologico;
    
    // Fetch weights for the selected symptoms
    const placeholders = sintomas.map((_, i) => `$${i + 1}`).join(",");
    const sintomasRes = await client.query(`SELECT id, score_f, score_m FROM sintomas WHERE id IN (${placeholders})`, sintomas);
    
    let scoreFinal = 0;
    for (const s of sintomasRes.rows) {
      scoreFinal += parseFloat(sexoBiologico === 'F' ? s.score_f : s.score_m);
    }

    // 2. Insert Checklist
    const preenchidoPor = role === "paciente" ? "paciente" : "medico";
    const idMedico = role === "medico" ? userId : null;

    const checklistRes = await client.query(
      `INSERT INTO checklists (id_paciente, id_medico, preenchido_por, score_final)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [idPaciente, idMedico, preenchidoPor, scoreFinal]
    );
    const idChecklist = checklistRes.rows[0].id;

    // 3. Insert Checklist Sintomas
    for (const sintomaId of sintomas) {
      await client.query(
        `INSERT INTO checklist_sintomas (id_checklist, id_sintoma, possui) VALUES ($1, $2, TRUE)`,
        [idChecklist, sintomaId]
      );
    }

    // 4. Upsert Medical History
    if (historico_medico) {
      // Check if history already exists
      const histRes = await client.query("SELECT id FROM historico_medico WHERE id_paciente = $1", [idPaciente]);
      if (histRes.rowCount && histRes.rowCount > 0) {
        // Update
        await client.query(
          `UPDATE historico_medico SET 
            ja_fez_pcr = $1, tipo_mutacao = $2, tem_autismo = $3, 
            hist_deficiencia_intelectual = $4, hist_menopausa_precoce = $5, 
            hist_ataxia = $6, interesse_exame = $7, tem_irmaos = $8
           WHERE id_paciente = $9`,
          [
            historico_medico.ja_fez_pcr, historico_medico.tipo_mutacao || null, historico_medico.tem_autismo,
            historico_medico.hist_deficiencia_intelectual, historico_medico.hist_menopausa_precoce,
            historico_medico.hist_ataxia, historico_medico.interesse_exame, historico_medico.tem_irmaos,
            idPaciente
          ]
        );
      } else {
        // Insert
        await client.query(
          `INSERT INTO historico_medico (
            id_paciente, ja_fez_pcr, tipo_mutacao, tem_autismo, 
            hist_deficiencia_intelectual, hist_menopausa_precoce, hist_ataxia, interesse_exame, tem_irmaos
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            idPaciente, historico_medico.ja_fez_pcr, historico_medico.tipo_mutacao || null, historico_medico.tem_autismo,
            historico_medico.hist_deficiencia_intelectual, historico_medico.hist_menopausa_precoce,
            historico_medico.hist_ataxia, historico_medico.interesse_exame, historico_medico.tem_irmaos
          ]
        );
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ success: true, id_checklist: idChecklist, score_final: scoreFinal });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar checklist:", err);
    res.status(500).json({ error: err.message || "Erro interno" });
  } finally {
    client.release();
  }
};
