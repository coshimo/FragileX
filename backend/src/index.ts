import express from "express";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { db } from "./config/database";
import { doubleCsrfProtection, generateCsrfToken } from "./config/csrf";

import sintomaRotas from "./routes/sintomasRotas";
import authRotas from "./routes/authRotas";
import pacientesRotas from "./routes/pacientesRotas";
import consultasRotas from "./routes/consultasRotas";
import checklistsRotas from "./routes/checklistsRotas";

const app = express();
const PgSessionStore = pgSession(session);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET || "fallback-secret-for-dev-only"));

app.use(session({
  store: new PgSessionStore({
    pool: db,
    tableName: "session",
  }),
  secret: process.env.SESSION_SECRET || "fallback-secret-for-dev-only",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
}));

// CSRF token endpoint (before CSRF protection middleware)
app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: generateCsrfToken(req, res) });
});

// CSRF protection for all state-changing routes
app.use(doubleCsrfProtection);

// Rate limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
});

app.use("/auth/login", authLimiter);
app.use("/auth/registro", authLimiter);

// Routes
app.use("/auth", authRotas);
app.use("/sintomas", sintomaRotas);
app.use("/pacientes", pacientesRotas);
app.use("/consultas", consultasRotas);
app.use("/checklists", checklistsRotas);

app.listen(3000, () => {
  console.log("Rodando na porta 3000");
});