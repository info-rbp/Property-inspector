export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  GEMINI_API_KEY: import.meta.env.VITE_API_KEY ?? '',
};

export type WebConfig = typeof config;
