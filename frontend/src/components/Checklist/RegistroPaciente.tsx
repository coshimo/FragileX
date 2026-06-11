import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiFetch } from "../../services/apiFetch";
import BotaoInicio from "../Shared/BotaoInicio";
import ItemCadastro from "./ItemCadastro";
import "./Checklist.css";

export default function RegistroPaciente() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 Data
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  // Step 2 Data
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexoBiologico, setSexoBiologico] = useState("");
  const [genero, setGenero] = useState("");
  const [sindrome, setSindrome] = useState("normal");

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email invalido");
      setLoading(false);
      return;
    }

    if (cpf) {
      const numericCpf = cpf.replace(/\D/g, "");
      if (numericCpf.length !== 11) {
        setError("CPF deve ter 11 dígitos");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await apiFetch("/auth/registro", {
        method: "POST",
        body: JSON.stringify({ nome, email, senha, cpf, telefone }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro no cadastro");
      }

      const userData = await res.json();
      setUserId(userData.id);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/auth/registro/completar", {
        method: "POST",
        body: JSON.stringify({ userId, dataNascimento, sexoBiologico, genero, sindrome }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao completar cadastro");
      }

      // Auto-login
      const meRes = await apiFetch("/auth/me");
      if (meRes.ok) {
        login(await meRes.json());
      }
      
      alert("Paciente registrado com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checklist-wrapper">
      {step === 1 ? (
        <form onSubmit={handleStep1} className="cadastro-form">
          <div className="checklist-container" style={{ marginBottom: "24px" }}>
            <h1 className="checklist-title">Passo 1: Conta de Acesso</h1>
            <p className="checklist-subtitle">Crie suas credenciais para acessar o sistema.</p>
            {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}

            <div className="cadastro-grid">
              <ItemCadastro label="Nome Completo" name="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
              <ItemCadastro label="E-mail" name="email" type="text" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <ItemCadastro label="Senha" name="senha" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
              <ItemCadastro label="CPF (Opcional)" name="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} />
              <ItemCadastro label="Telefone" name="telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
          </div>
          <div className="form-actions" style={{ gap: "16px" }}>
            <BotaoInicio />
            <button type="submit" className="checklist-submit-btn" disabled={loading}>
              {loading ? "Verificando..." : "Próximo Passo"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleStep2} className="cadastro-form">
          <div className="checklist-container" style={{ marginBottom: "24px" }}>
            <h1 className="checklist-title">Passo 2: Dados do Paciente</h1>
            <p className="checklist-subtitle">Preencha as informações médicas do paciente.</p>
            {error && <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>}

            <div className="cadastro-grid">
              <ItemCadastro label="Data de Nascimento" name="dataNascimento" type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} />
              
              <div className="cadastro-item">
                <label className="cadastro-label">Sexo Biológico <span className="required-asterisk">*</span></label>
                <select className="cadastro-input" required value={sexoBiologico} onChange={(e) => setSexoBiologico(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Gênero <span className="required-asterisk">*</span></label>
                <select className="cadastro-input" required value={genero} onChange={(e) => setGenero(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Relação com a Síndrome <span className="required-asterisk">*</span></label>
                <select className="cadastro-input" required value={sindrome} onChange={(e) => setSindrome(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="mutacao">Mutação Completa</option>
                  <option value="pre_mutacao">Pré-Mutação</option>
                </select>
              </div>
            </div>
          </div>
          <div className="form-actions" style={{ gap: "16px" }}>
            <button type="button" className="hero-btn-secondary" onClick={() => setStep(1)} disabled={loading}>Voltar</button>
            <button type="submit" className="checklist-submit-btn" disabled={loading}>
              {loading ? "Salvando..." : "Finalizar Cadastro"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
