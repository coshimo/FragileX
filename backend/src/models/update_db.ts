import { db } from '../config/database';

async function updateDb() {
  const client = await db.connect();

  try {
    console.log('Iniciando atualização do banco de dados...');
    await client.query('BEGIN');

    // 1. Adicionando novas colunas em `pacientes`
    console.log('Alterando tabela pacientes...');
    await client.query(`
      ALTER TABLE pacientes 
      ADD COLUMN IF NOT EXISTS nome_mae VARCHAR(100),
      ADD COLUMN IF NOT EXISTS nome_pai VARCHAR(100),
      ADD COLUMN IF NOT EXISTS nome_responsavel VARCHAR(100),
      ADD COLUMN IF NOT EXISTS grau_parentesco VARCHAR(50),
      ADD COLUMN IF NOT EXISTS cpf_responsavel VARCHAR(14)
    `);

    // 2. Criando a tabela `enderecos`
    console.log('Criando tabela enderecos...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS enderecos (
        id SERIAL PRIMARY KEY,
        id_usuario INT NOT NULL,
        rua VARCHAR(255),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        estado VARCHAR(50),
        pais VARCHAR(50),
        CONSTRAINT fk_endereco_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);

    // 3. Criando a tabela `noticias`
    console.log('Criando tabela noticias...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS noticias (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255),
        mensagem TEXT,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query('COMMIT');
    console.log('Atualização do banco concluída com sucesso!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar o banco de dados. Transação revertida.', error);
  } finally {
    client.release();
    process.exit();
  }
}

updateDb();
