import { criarUsuario } from "./services/criarUsuario";
import { logarUsuario } from "./services/logarUsuario";
import { verificarEmail } from "./services/verificarEmail";
import express from "express";
import cors from "cors";
import sintomaRotas from "./routes/sintomasRotas";
import authRotas from "./routes/authRotas";



// criarUsuario("Filho da puta", "este@gmail.com", "123456", "12345678900", "11999999999")

// const emailVerificado = verificarEmail("teste@gmail.com").then((emailExiste) => {
//     console.log("Email existe?", emailExiste);
// }).catch((error) => {
//     console.error("Erro ao verificar email:", error);
// }).finally(() => {process.exit();});

// logarUsuario("12345678900", "123456").then((senhaValida) => {
//     console.log("Senha válida?", senhaValida);
// }).catch((error) => {
//     console.error("Erro ao logar usuário:", error);
// }).finally(() => {process.exit();});

const app = express();
app.use(cors());

app.use(express.json());

app.use('/auth', authRotas);
app.use('/sintomas', sintomaRotas);

app.listen(3000, () => {console.log("Rodando")});