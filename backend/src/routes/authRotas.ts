import { Router } from 'express';
import { login } from '../controllers/authController';

const authRotas = Router();

authRotas.post('/login', login);

export default authRotas;
