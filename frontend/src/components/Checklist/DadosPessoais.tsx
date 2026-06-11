import ItemCadastro from "./ItemCadastro";

const DadosPessoais = ({ isMedico = false }: { isMedico?: boolean }) => {
  return (
    <div
      className="checklist-container"
      style={{ marginBottom: "24px" }}
    >
      <h1 className="checklist-title">Dados do Paciente</h1>
      <p className="checklist-subtitle">Preencha as informações pessoais e de contato.</p>

      <div className="cadastro-grid">
        <ItemCadastro
          label="Nome do Paciente"
          name="nomePaciente"
          required
        />
        <ItemCadastro
          label="CPF do Paciente"
          name="cpfPaciente"
          required
        />
        <ItemCadastro
          label="Data de Nascimento"
          name="dataNascimento"
          type="date"
          required
        />

        <div className="cadastro-item">
          <label className="cadastro-label">
            Sexo Biológico <span className="required-asterisk">*</span>
          </label>
          <select
            className="cadastro-input"
            name="sexo_biologico"
            required
          >
            <option value="">Selecione...</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <div className="cadastro-item">
          <label className="cadastro-label">Gênero</label>
          <select
            className="cadastro-input"
            name="genero"
          >
            <option value="">Selecione...</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        <ItemCadastro
          label="Nome da Mãe"
          name="nomeMae"
          required
        />
        <ItemCadastro
          label="Nome do Pai"
          name="nomePai"
        />
        <ItemCadastro
          label="Responsável pelo Paciente"
          name="nomeResponsavel"
          required
        />
        <ItemCadastro
          label="Grau de parentesco"
          name="grauParentesco"
          required
        />
        <ItemCadastro
          label="CPF do responsável"
          name="cpfResponsavel"
          required
        />

        <ItemCadastro
          label="Rua"
          name="rua"
          required
        />
        <ItemCadastro
          label="Bairro"
          name="bairro"
          required
        />
        <ItemCadastro
          label="Cidade"
          name="cidade"
          required
        />
        <ItemCadastro
          label="Estado"
          name="estado"
          required
        />
        <ItemCadastro
          label="País"
          name="pais"
          required
        />
      </div>

      <h2 className="cadastro-section-title">Formas de Contato</h2>
      <div className="cadastro-grid">
        <ItemCadastro
          label="Whatsapp"
          name="whatsapp"
          type="tel"
        />
        <ItemCadastro
          label="Telefone para Ligações"
          name="telefone"
          type="tel"
          required
        />
        <ItemCadastro
          label="Telefone 2"
          name="telefone2"
          type="tel"
        />
        <ItemCadastro
          label="E-Mail"
          name="email"
          type="email"
          required
        />
      </div>
    </div>
  );
};

export default DadosPessoais;
