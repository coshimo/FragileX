import type { Sintoma } from "../../../shared/classes/sintoma";
import { apiClient } from "./apiClient";

export async function getSintomas() {
  try {
    const sintomas: Sintoma[] = await apiClient('/sintomas');
    return sintomas;
  } catch (error) {
    console.error("Erro ao obter sintomas:", error);
    throw error;
  }
}
