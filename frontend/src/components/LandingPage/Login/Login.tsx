import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { apiFetch } from "../../../services/apiFetch";
import "../../Checklist/Checklist.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const isEmailFormat = usuario.includes("@");
    if (isEmailFormat) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(usuario)) {
        setError("Email invalido");
        setLoading(false);
        return;
      }
    } else {
      const numericCpf = usuario.replace(/\D/g, "");
      if (numericCpf.length !== 11) {
        setError("CPF deve ter 11 dígitos");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ usuario, senha }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao fazer login");
      }

      const userData = await res.json();
      login(userData);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checklist-wrapper">
      <div className="checklist-container">
        <h1 className="checklist-title">Acesso ao Sistema</h1>
        <p className="checklist-subtitle">Faça login com seu E-mail ou CPF.</p>

        {error && <div style={{ color: "red", marginBottom: "16px", textAlign: "center" }}>{error}</div>}

        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "300px", margin: "0 auto" }}
        >
          <div
            className="cadastro-item"
            style={{ marginBottom: 0 }}
          >
            <label className="cadastro-label">E-mail ou CPF</label>
            <input
              type="text"
              className="cadastro-input"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </div>

          <div
            className="cadastro-item"
            style={{ marginBottom: 0 }}
          >
            <label className="cadastro-label">Senha</label>
            <input
              type="password"
              className="cadastro-input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="checklist-submit-btn"
            disabled={loading}
            style={{ marginTop: "16px" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <button
            className="hero-btn-secondary"
            onClick={() => navigate("/registro")}
            style={{ width: "100%", maxWidth: "300px" }}
          >
            Não tem conta? Cadastre-se
          </button>
          <button
            className="hero-btn-secondary"
            onClick={() => navigate("/")}
            style={{ width: "100%", maxWidth: "300px" }}
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
