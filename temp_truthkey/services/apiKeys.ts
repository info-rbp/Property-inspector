export function getGeminiApiKey(): string {
  // 1. Prefer Vite env injection first (standard for this project structure)
  const vite = (import.meta as any)?.env;
  const v = vite?.VITE_GEMINI_API_KEY;
  if (v) return String(v);

  // 2. Fall back to runtime-injected values (AI Studio, window globals, standard process.env)
  const w = window as any;
  const p = (globalThis as any).process;

  return (
    (p?.env?.GEMINI_API_KEY as string) ||
    (p?.env?.API_KEY as string) ||
    (w?.GEMINI_API_KEY as string) ||
    (w?.API_KEY as string) ||
    ""
  );
}

export function getGoogleMapsApiKey(): string {
  // 1. Prefer Vite env injection first
  const vite = (import.meta as any)?.env;
  const v = vite?.VITE_GOOGLE_MAPS_API_KEY;
  if (v) return String(v);

  // 2. Fall back to runtime-injected values
  const w = window as any;
  const p = (globalThis as any).process;

  return (
    (p?.env?.GOOGLE_MAPS_API_KEY as string) ||
    (w?.GOOGLE_MAPS_API_KEY as string) ||
    ""
  );
}