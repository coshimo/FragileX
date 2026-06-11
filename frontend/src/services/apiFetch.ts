import { URL_API } from "../config/api";

let csrfToken: string | null = null;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  
  headers.set("Content-Type", "application/json");
  
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(options.method?.toUpperCase() || "GET")) {
    headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${URL_API}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Ensure cookies are sent
  });

  return response;
};
