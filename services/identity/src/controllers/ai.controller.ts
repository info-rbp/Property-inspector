import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from "@google/genai";
import { z } from 'zod';
import { BadRequestError } from '../utils/errors';

const getAi = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const chat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            message: z.string().min(1),
            history: z.array(z.object({
                role: z.enum(['user', 'model']),
                parts: z.array(z.object({ text: z.string() }))
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
    } catch (error) {
        next(error);
    }
};

export const fast = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            prompt: z.string().min(1)
        });
        const { prompt } = schema.parse(req.body);

        const ai = getAi();
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt
        });
        res.json({ text: result.text });
    } catch (error) {
        next(error);
    }
};

export const think = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            prompt: z.string().min(1)
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
    } catch (error) {
        next(error);
    }
};

export const generate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const schema = z.object({
            prompt: z.string().min(1)
        });
        const { prompt } = schema.parse(req.body);

        const ai = getAi();
        // Uses gemini-2.5-flash for general intelligence tasks as per guidelines
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        res.json({ text: result.text });
    } catch (error) {
        next(error);
    }
};
