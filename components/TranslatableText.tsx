import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

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
