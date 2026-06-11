import { Router } from "express";
import { saveChecklist } from "../controllers/checklistsController";
import { authMiddleware } from "../config/authMiddleware";

const checklistsRotas = Router();

checklistsRotas.post("/", authMiddleware, saveChecklist);

export default checklistsRotas;
