import { apiClient } from "./apiClient";

export async function sendCadastro(dadosFinais: object) {
  try {
    const response = await apiClient('/cadastro', {
      method: "POST",
      body: JSON.stringify(dadosFinais),
    });
    
    return response;
  } catch (error) {
    console.error("Erro ao enviar cadastro:", error);
    throw error;
  }
}
