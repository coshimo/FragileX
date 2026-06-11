import { Router } from "express";
import { criarConsulta, fetchConsultasPaciente } from "../controllers/consultasController";
import { authMiddleware } from "../config/authMiddleware";

const router = Router();

router.post("/", authMiddleware, criarConsulta);
router.get("/paciente/:id", authMiddleware, fetchConsultasPaciente);

export default router;
