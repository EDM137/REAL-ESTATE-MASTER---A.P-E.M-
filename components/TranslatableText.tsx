/**
 * WATERMARK: Property of Eric Daniel Malley, Radest Publishing Co.
 * TIMESTAMP: 2026-02-26T00:58:47-08:00
 * IP PROTECTION ENABLED
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

interface TranslatableTextProps {
    children: string;
    targetLanguage: string;
    className?: string;
}

const translationCache: Record<string, Record<string, string>> = {};

const TranslatableText: React.FC<TranslatableTextProps> = ({ children, targetLanguage, className }) => {
    const [translated, setTranslated] = useState(children);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (targetLanguage === 'English' || !children.trim()) {
            setTranslated(children);
            return;
        }

        const cacheKey = `${targetLanguage}:${children}`;
        if (translationCache[cacheKey]) {
            setTranslated(translationCache[cacheKey] as any);
            return;
        }

        const translate = async () => {
            if (!process.env.API_KEY) return;
            setIsLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Translate the following UI text to ${targetLanguage}. Keep it concise and maintain the same tone. Respond with ONLY the translation: "${children}"`;
                const result = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: {
                        systemInstruction: "You are a high-fidelity UI translator. Provide direct, unfiltered, and literal translations.",
                        safetySettings: [
                            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        ]
                    }
                });
                const text = result.text?.trim() || children;
                translationCache[cacheKey] = text as any;
                setTranslated(text);
            } catch (e) {
                console.error("Translation error:", e);
            } finally {
                setIsLoading(false);
            }
        };

        translate();
    }, [children, targetLanguage]);

    return (
        <span className={`${className} ${isLoading ? 'opacity-50 animate-pulse' : ''}`}>
            {translated}
        </span>
    );
};

export default TranslatableText;
