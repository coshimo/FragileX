import { Router } from "express";
import { login, registro, completarRegistro, checkCpf, checkEmail, logout, me } from "../controllers/authController";

const router = Router();

router.post("/login", login);
router.post("/registro", registro);
router.post("/registro/completar", completarRegistro);
router.post("/verificar-cpf", checkCpf);
router.post("/verificar-email", checkEmail);
router.post("/logout", logout);
router.get("/me", me);

export default router;
