CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicos (
    id_usuario INT PRIMARY KEY,
    crm VARCHAR(20) UNIQUE NOT NULL,
    especialidade VARCHAR(50),
    CONSTRAINT fk_medico_usuario FOREIGN KEY (id_usuario) 
	REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE pacientes (
    id_usuario INT PRIMARY KEY,
    data_nascimento DATE NOT NULL,
    sexo_biologico CHAR(1) CHECK (sexo_biologico IN ('M', 'F')) NOT NULL,
	genero CHAR(15) CHECK (genero IN ('Feminino', 'Masculino')) NOT NULL,
	sindrome VARCHAR(20) CHECK (sindrome IN ('normal', 'mutacao', 'pre_mutacao')) NOT NULL,
    id_medico_responsavel INT,
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_usuario)
	REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_medico_responsavel FOREIGN KEY (id_medico_responsavel)
	REFERENCES medicos(id_usuario) ON DELETE SET NULL
);

CREATE TABLE historico_medico (
    id SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL, 
    ja_fez_pcr BOOLEAN DEFAULT FALSE,
    tipo_mutacao VARCHAR(50),
    tem_autismo BOOLEAN DEFAULT FALSE,
    hist_deficiencia_intelectual BOOLEAN DEFAULT FALSE,
    hist_menopausa_precoce BOOLEAN DEFAULT FALSE,
    hist_ataxia BOOLEAN DEFAULT FALSE,
	interesse_exame BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_historico_paciente FOREIGN KEY (id_paciente)
    REFERENCES pacientes(id_usuario) ON DELETE CASCADE
);

CREATE TABLE exame (
    id_documento SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL,
	id_medico INT NOT NULL,
    tipo_exame VARCHAR(100),
    caminho_arquivo VARCHAR(255) NOT NULL,
    data_upload DATE DEFAULT CURRENT_DATE,
	CONSTRAINT fk_exame_paciente FOREIGN KEY (id_paciente) 
	REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
	CONSTRAINT fk_exame_medico FOREIGN KEY (id_medico) 
	REFERENCES medicos(id_usuario) ON DELETE CASCADE
);

CREATE TABLE funcionarios_ibk (
    id_usuario INT PRIMARY KEY,
    
    CONSTRAINT fk_funcionario_usuario FOREIGN KEY (id_usuario) 
	REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE sintomas (
    id SERIAL PRIMARY KEY,
    sintoma VARCHAR(150) NOT NULL,
    score_f DECIMAL(4,2) NOT NULL,
    score_m DECIMAL(4,2) NOT NULL
);

CREATE TABLE checklists (
    id SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT,
    preenchido_por VARCHAR(50) NOT NULL,
    score_final DECIMAL(4,2),
    data_preenchimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checklist_paciente FOREIGN KEY (id_paciente) 
	REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
	CONSTRAINT fk_checklist_medico FOREIGN KEY (id_medico) 
	REFERENCES medicos(id_usuario) ON DELETE SET NULL
);

-- associativa checklist/sintomas
CREATE TABLE checklist_sintomas (
    id_checklist INT NOT NULL,
    id_sintoma INT NOT NULL,
    possui BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_checklist, id_sintoma),
    CONSTRAINT fk_cs_checklist FOREIGN KEY (id_checklist) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_cs_sintoma FOREIGN KEY (id_sintoma) REFERENCES sintomas(id) ON DELETE CASCADE
);

-- consultas (independentes de checklists)
CREATE TABLE consultas (
    id SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    id_checklist INT,
    CONSTRAINT fk_consulta_paciente FOREIGN KEY (id_paciente)
	REFERENCES pacientes(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_consulta_medico FOREIGN KEY (id_medico)
	REFERENCES medicos(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_consulta_checklist FOREIGN KEY (id_checklist)
	REFERENCES checklists(id) ON DELETE SET NULL
);

-- sessoes (connect-pg-simple)
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL
);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");