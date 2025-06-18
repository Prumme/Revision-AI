export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: "",
  } as Record<string, string>,
} as const;
