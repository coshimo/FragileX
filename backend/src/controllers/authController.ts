import { Request, Response } from "express";
import { criarUsuario } from "../services/criarUsuario";
import { logarUsuario } from "../services/logarUsuario";
import { verificarEmail } from "../services/verificarEmail";
import { verificarCpf } from "../services/verificarCpf";
import { detectarRole } from "../services/detectarRole";
import { db } from "../config/database";

export const login = async (req: Request, res: Response) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    res.status(400).json({ error: "Credenciais obrigatórias" });
    return;
  }

  try {
    const user = await logarUsuario(usuario, senha);
    if (!user) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const role = await detectarRole(user.id);

    (req.session as any).userId = user.id;
    (req.session as any).role = role;

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const registro = async (req: Request, res: Response) => {
  const { nome, email, senha, cpf, telefone } = req.body;

  if (!nome || !email || !senha) {
    res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    return;
  }

  try {
    const emailExiste = await verificarEmail(email);
    if (emailExiste) {
      res.status(409).json({ error: "E-mail já cadastrado" });
      return;
    }

    if (cpf) {
      const cpfExiste = await verificarCpf(cpf);
      if (cpfExiste) {
        res.status(409).json({ error: "CPF já cadastrado" });
        return;
      }
    }

    const user = await criarUsuario(nome, email, senha, cpf || null, telefone || null);

    // Return the new user's id so the frontend can proceed to page 2
    res.status(201).json({
      id: user.id,
      nome: user.nome,
      email: user.email,
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const completarRegistro = async (req: Request, res: Response) => {
  const {
    userId, dataNascimento, sexoBiologico, genero, sindrome,
    nomeMae, nomePai, responsavelNome, responsavelParentesco, responsavelCpf,
    cidade, estado, pais, telefone2, whatsapp
  } = req.body;

  if (!userId || !dataNascimento || !sexoBiologico || !genero || !sindrome || !nomeMae || !responsavelNome || !responsavelParentesco || !responsavelCpf || !cidade || !estado || !pais) {
    res.status(400).json({ error: "Dados obrigatórios faltando" });
    return;
  }

  try {
    const query = `INSERT INTO pacientes (
                     id_usuario, data_nascimento, sexo_biologico, genero, sindrome,
                     nome_mae, nome_pai, responsavel_nome, responsavel_parentesco, responsavel_cpf,
                     cidade, estado, pais, telefone_2, whatsapp
                   )
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`;
    const valores = [
      userId, dataNascimento, sexoBiologico, genero, sindrome,
      nomeMae, nomePai || null, responsavelNome, responsavelParentesco, responsavelCpf,
      cidade, estado, pais, telefone2 || null, whatsapp || null
    ];
    const resultado = await db.query(query, valores);

    // Auto-login after completing registration
    (req.session as any).userId = userId;
    (req.session as any).role = "paciente";

    res.status(201).json({ paciente: resultado.rows[0] });
  } catch (error) {
    console.error("Erro ao completar registro:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const checkCpf = async (req: Request, res: Response) => {
  const { cpf } = req.body;

  if (!cpf) {
    res.status(400).json({ error: "CPF obrigatório" });
    return;
  }

  try {
    const exists = await verificarCpf(cpf);
    res.json({ exists });
  } catch (error) {
    console.error("Erro ao verificar CPF:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const checkEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email obrigatório" });
    return;
  }

  try {
    const exists = await verificarEmail(email);
    res.json({ exists });
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erro ao destruir sessão:", err);
      res.status(500).json({ error: "Erro interno" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logout realizado" });
  });
};

export const me = async (req: Request, res: Response) => {
  const userId = (req.session as any).userId;

  if (!userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }

  try {
    const query = "SELECT id, nome, email, cpf, telefone FROM usuarios WHERE id = $1";
    const resultado = await db.query(query, [userId]);

    if (resultado.rowCount === null || resultado.rowCount <= 0) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const user = resultado.rows[0];
    const role = await detectarRole(user.id);

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role,
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno" });
  }
};
