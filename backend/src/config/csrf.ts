import { doubleCsrf } from "csrf-csrf";

export const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "fallback-csrf-secret-dev-only",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
  getSessionIdentifier: (req: any) => {
    return req.session?.userId || req.sessionID || "unknown";
  },
  getCsrfTokenFromRequest: (req: any) => req.headers["x-csrf-token"] as string,
});
