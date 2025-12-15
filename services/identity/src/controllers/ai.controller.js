"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.think = exports.fast = exports.chat = void 0;
const genai_1 = require("@google/genai");
const zod_1 = require("zod");
const getAi = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    return new genai_1.GoogleGenAI({ apiKey: process.env.API_KEY });
};
const chat = async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            message: zod_1.z.string().min(1),
            history: zod_1.z.array(zod_1.z.object({
                role: zod_1.z.enum(['user', 'model']),
                parts: zod_1.z.array(zod_1.z.object({ text: zod_1.z.string() }))
            })).optional()
        });
        const { message, history } = schema.parse(req.body);
        const ai = getAi();
        const chatSession = ai.chats.create({
            model: 'gemini-3-pro-preview',
            history: history
        });
        const result = await chatSession.sendMessage({ message });
        res.json({ text: result.text });
    }
    catch (error) {
        next(error);
    }
};
exports.chat = chat;
const fast = async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            prompt: zod_1.z.string().min(1)
        });
        const { prompt } = schema.parse(req.body);
        const ai = getAi();
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt
        });
        res.json({ text: result.text });
    }
    catch (error) {
        next(error);
    }
};
exports.fast = fast;
const think = async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            prompt: zod_1.z.string().min(1)
        });
        const { prompt } = schema.parse(req.body);
        const ai = getAi();
        const result = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        res.json({ text: result.text });
    }
    catch (error) {
        next(error);
    }
};
exports.think = think;
const generate = async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            prompt: zod_1.z.string().min(1)
        });
        const { prompt } = schema.parse(req.body);
        const ai = getAi();
        // Uses gemini-2.5-flash for general intelligence tasks as per guidelines
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        res.json({ text: result.text });
    }
    catch (error) {
        next(error);
    }
};
exports.generate = generate;
