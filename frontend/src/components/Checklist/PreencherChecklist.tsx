import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { getSintomas } from "../../services/getSintomas";
import ChecklistItems from "./ChecklistItems";
import ItemCadastro from "./ItemCadastro";
import BotaoInicio from "../Shared/BotaoInicio";
import "./Checklist.css";
import { useNavigate } from "react-router-dom";

const promiseSintomas = getSintomas();

interface Props {
  isRapido?: boolean;
}

export default function PreencherChecklist({ isRapido = false }: Props) {
  const [sintomasSelecionados, setSintomasSelecionados] = useState<number[]>([]);
  const navigate = useNavigate();

  // Questionnaire States
  const [jaFezPcr, setJaFezPcr] = useState("");
  const [interesseExame, setInteresseExame] = useState("");
  const [tipoMutacao, setTipoMutacao] = useState("");
  const [temAutismo, setTemAutismo] = useState("");
  const [temIrmaos, setTemIrmaos] = useState("");
  const [histDeficiencia, setHistDeficiencia] = useState("");
  const [histMenopausa, setHistMenopausa] = useState("");
  const [histAtaxia, setHistAtaxia] = useState("");
  const [termos, setTermos] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFinalizar = async () => {
    if (sintomasSelecionados.length === 0) {
      alert("Por favor, selecione ao menos um sintoma.");
      return;
    }
    if (!isRapido && !termos) {
      alert("Você deve aceitar os termos e condições.");
      return;
    }

    setLoading(true);

    if (isRapido) {
      alert(`Checklist Rápido finalizado!\nSintomas selecionados: ${sintomasSelecionados.length}\n(Score estimado: ${(sintomasSelecionados.length * 2.5).toFixed(1)})`);
      navigate('/dashboard');
      setLoading(false);
    } else {
      const payload = {
        sintomas: sintomasSelecionados,
        historico_medico: {
          ja_fez_pcr: jaFezPcr === "sim",
          interesse_exame: interesseExame === "sim",
          tipo_mutacao: tipoMutacao,
          tem_autismo: temAutismo === "sim",
          tem_irmaos: temIrmaos === "sim",
          hist_deficiencia_intelectual: histDeficiencia === "sim",
          hist_menopausa_precoce: histMenopausa === "sim",
          hist_ataxia: histAtaxia === "sim",
        }
      };

      try {
        // Assume user is authenticated, backend infers patient ID from session
        const { apiFetch } = await import("../../services/apiFetch");
        const res = await apiFetch("/checklists", {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Erro ao salvar checklist");
        }
        alert("Checklist formal salvo com sucesso para o paciente!");
        navigate('/dashboard');
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="checklist-wrapper">
      <form className="cadastro-form" onSubmit={(e) => { e.preventDefault(); handleFinalizar(); }}>

        {!isRapido && (
          <div className="checklist-container" style={{ marginBottom: "24px" }}>
            <h2 className="checklist-title" style={{ fontSize: '1.5rem' }}>Questionário</h2>
            <p className="checklist-subtitle">Responda às perguntas abaixo antes de selecionar os sintomas.</p>
            
            <div className="cadastro-grid" style={{ gridTemplateColumns: "1fr", gap: "24px" }}>
              <div className="cadastro-item">
                <label className="cadastro-label">Já fez exame de DNA (sangue, saliva, etc.) para detectar a Síndrome do X Frágil (SXF)? <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="jaFezPcr" value="nao" required onChange={(e) => setJaFezPcr(e.target.value)} /> Não</label>
                  <label><input type="radio" name="jaFezPcr" value="sim" required onChange={(e) => setJaFezPcr(e.target.value)} /> Sim</label>
                </div>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Tem interesse em fazer o exame de DNA para X Frágil (PCR)?</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="interesseExame" value="nao" onChange={(e) => setInteresseExame(e.target.value)} /> Não</label>
                  <label><input type="radio" name="interesseExame" value="sim" onChange={(e) => setInteresseExame(e.target.value)} /> Sim</label>
                </div>
              </div>

              {jaFezPcr === "sim" && (
                <div className="cadastro-item">
                  <label className="cadastro-label">Se SIM (já tem resultado confirmado por laboratório), qual o resultado (conforme número de repetições CGG)?</label>
                  <select className="cadastro-input" value={tipoMutacao} onChange={(e) => setTipoMutacao(e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="Mutação Completa">Mutação Completa (+200 repetições)</option>
                    <option value="Pré-mutação">Pré-mutação (55 a 199 repetições)</option>
                    <option value="Zona Gray/Intermediária">Zona Gray/Intermediária (45 a 54 repetições)</option>
                    <option value="Mosaicismo">Mosaicismo</option>
                    <option value="Negativo">Negativo para XF (até 39 repetições)</option>
                    <option value="Não Sei">Não Sei</option>
                  </select>
                </div>
              )}

              <div className="cadastro-item">
                <label className="cadastro-label">Possui diagnóstico de AUTISMO? <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="temAutismo" value="nao" required onChange={(e) => setTemAutismo(e.target.value)} /> Não</label>
                  <label><input type="radio" name="temAutismo" value="sim" required onChange={(e) => setTemAutismo(e.target.value)} /> Sim</label>
                </div>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Tem IRMÃOS? <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="temIrmaos" value="nao" required onChange={(e) => setTemIrmaos(e.target.value)} /> Não</label>
                  <label><input type="radio" name="temIrmaos" value="sim" required onChange={(e) => setTemIrmaos(e.target.value)} /> Sim</label>
                </div>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Há alguém na família com deficiência intelectual, atraso de desenvolvimento, dificuldades de aprendizagem ou autismo? <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="histDeficiencia" value="nao" required onChange={(e) => setHistDeficiencia(e.target.value)} /> Não</label>
                  <label><input type="radio" name="histDeficiencia" value="sim" required onChange={(e) => setHistDeficiencia(e.target.value)} /> Sim</label>
                  <label><input type="radio" name="histDeficiencia" value="nao_sei" required onChange={(e) => setHistDeficiencia(e.target.value)} /> Não Sei</label>
                </div>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Há antecedentes na família com diagnóstico de menopausa precoce? <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="histMenopausa" value="nao" required onChange={(e) => setHistMenopausa(e.target.value)} /> Não</label>
                  <label><input type="radio" name="histMenopausa" value="sim" required onChange={(e) => setHistMenopausa(e.target.value)} /> Sim</label>
                  <label><input type="radio" name="histMenopausa" value="nao_sei" required onChange={(e) => setHistMenopausa(e.target.value)} /> Não Sei</label>
                </div>
              </div>

              <div className="cadastro-item">
                <label className="cadastro-label">Há antecedentes na família com ataxia (descoordenação motora) e tremores? <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label><input type="radio" name="histAtaxia" value="nao" required onChange={(e) => setHistAtaxia(e.target.value)} /> Não</label>
                  <label><input type="radio" name="histAtaxia" value="sim" required onChange={(e) => setHistAtaxia(e.target.value)} /> Sim</label>
                  <label><input type="radio" name="histAtaxia" value="nao_sei" required onChange={(e) => setHistAtaxia(e.target.value)} /> Não Sei</label>
                </div>
              </div>

            </div>
          </div>
        )}

        <ErrorBoundary
          fallback={
            <div className="checklist-container checklist-error-container">
              <h2 className="checklist-error-title">Ops! Algo deu errado.</h2>
              <button className="checklist-retry-btn" onClick={() => window.location.reload()}>
                Tentar Novamente
              </button>
            </div>
          }
        >
          <Suspense fallback={<div className="checklist-container"><h2 className="checklist-loading">Carregando checklist...</h2></div>}>
            <div className="checklist-container">
              <h1 className="checklist-title">
                {isRapido ? "Checklist Rápido (Sem Vínculo)" : "Checklist de Sintomas"}
              </h1>
              <p className="checklist-subtitle">
                {isRapido
                  ? "Avalie os sintomas rapidamente. Estes dados não serão salvos no banco de dados."
                  : "Selecione os sintomas observados no paciente."}
              </p>
              <ChecklistItems
                promiseSintomas={promiseSintomas}
                onChange={setSintomasSelecionados}
              />
            </div>
          </Suspense>
        </ErrorBoundary>

        {!isRapido && (
          <div className="checklist-container" style={{ marginTop: "24px", padding: "16px", background: "#f8f9fa", borderRadius: "8px" }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" required checked={termos} onChange={(e) => setTermos(e.target.checked)} />
              <span style={{ fontSize: '0.9rem' }}>Eu estou de acordo com os termos e condições</span>
            </label>
          </div>
        )}

        <div className="form-actions" style={{ gap: '16px', marginTop: '24px' }}>
          <BotaoInicio />
          <button type="submit" className="checklist-submit-btn" disabled={loading}>
            {loading ? "Processando..." : (isRapido ? "Calcular Score" : "Salvar Checklist")}
          </button>
        </div>
      </form>
    </div>
  );
}
