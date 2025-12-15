import { Hono } from 'hono';
type Bindings = {
    GEMINI_API_KEY: string;
    KV: KVNamespace;
};
declare const app: Hono<{
    Bindings: Bindings;
}, import("hono/types").BlankSchema, "/">;
export default app;
