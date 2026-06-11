import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { executeTransaction } from '../config/transaction';
import { db } from '../config/database';

export const cadastrarPaciente = async (req: Request, res: Response) => {
    try {
        const {
            nomePaciente,
            cpfPaciente,
            dataNascimento,
            sexo_biologico,
            genero,
            nomeMae,
            nomePai,
            nomeResponsavel,
            grauParentesco,
            cpfResponsavel,
            rua,
            bairro,
            cidade,
            estado,
            pais,
            whatsapp,
            telefone,
            telefone2,
            email,
            senha
        } = req.body;

        // 1. Gerar Hash da Senha
        const salt = await bcrypt.genSalt(10);
        // Se a senha não for fornecida no formulário de paciente, usaremos o CPF provisoriamente
        const senhaDefinitiva = senha || cpfPaciente;
        const senhaHash = await bcrypt.hash(senhaDefinitiva, salt);

        // Usar um client normal e transações manuais caso a função executeTransaction
        // precise de refatorações, mas como já abstraímos:
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // Insert na tabela Usuarios
            const usuarioQuery = `
                INSERT INTO usuarios (nome, cpf, email, telefone, senha_hash)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id;
            `;
            const usuarioValues = [nomePaciente, cpfPaciente, email, telefone, senhaHash];
            const usuarioResult = await client.query(usuarioQuery, usuarioValues);
            const idUsuario = usuarioResult.rows[0].id;

            // Insert na tabela Pacientes
            // Assumimos 'sindrome' como 'normal' inicialmente se não vier do form
            const sindrome = req.body.sindrome || 'normal';
            
            const pacienteQuery = `
                INSERT INTO pacientes (
                    id_usuario, data_nascimento, sexo_biologico, genero, sindrome,
                    nome_mae, nome_pai, nome_responsavel, grau_parentesco, cpf_responsavel
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
            `;
            const sexoChar = sexo_biologico === 'masculino' ? 'M' : 'F';
            const generoFormatado = genero === 'masculino' ? 'Masculino' : 'Feminino';
            
            const pacienteValues = [
                idUsuario, dataNascimento, sexoChar, generoFormatado, sindrome,
                nomeMae, nomePai, nomeResponsavel, grauParentesco, cpfResponsavel
            ];
            await client.query(pacienteQuery, pacienteValues);

            // Insert na tabela Enderecos
            const enderecoQuery = `
                INSERT INTO enderecos (id_usuario, rua, bairro, cidade, estado, pais)
                VALUES ($1, $2, $3, $4, $5, $6);
            `;
            const enderecoValues = [idUsuario, rua, bairro, cidade, estado, pais];
            await client.query(enderecoQuery, enderecoValues);

            await client.query('COMMIT');

            res.status(201).json({ message: 'Paciente cadastrado com sucesso!', id: idUsuario });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Erro no controller de cadastro:', error);
        res.status(500).json({ error: 'Erro interno ao realizar cadastro.' });
    }
};
