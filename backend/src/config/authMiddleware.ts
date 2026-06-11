import { Request, Response, NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !(req.session as any).userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  next();
};
