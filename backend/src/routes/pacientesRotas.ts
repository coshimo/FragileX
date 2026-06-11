import { Router } from "express";
import { fetchPacientes, fetchPacienteById } from "../controllers/pacientesController";
import { authMiddleware } from "../config/authMiddleware";

const router = Router();

router.get("/", authMiddleware, fetchPacientes);
router.get("/:id", authMiddleware, fetchPacienteById);

export default router;
