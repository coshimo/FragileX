import { Router } from 'express';
import { cadastrarPaciente } from '../controllers/cadastroController';

const cadastroRotas = Router();

cadastroRotas.post('/', cadastrarPaciente);

export default cadastroRotas;
