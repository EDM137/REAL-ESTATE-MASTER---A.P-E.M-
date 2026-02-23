import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Languages } from './ui/Icons';
import { GoogleGenAI } from '@google/genai';

const languages = [
    "Spanish", "French", "German", "Japanese", "Mandarin", "Russian", "Arabic", "Vietnamese"
];

const Translator: React.FC = () => {
    const [text, setText] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('Spanish');
    const [isLoading, setIsLoading] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const [error, setError] = useState('');
    const [ai, setAi] = useState<GoogleGenAI | null>(null);

    useEffect(() => {
        if (process.env.API_KEY) {
            setAi(new GoogleGenAI({ apiKey: process.env.API_KEY }));
        }
    }, []);

    const handleTranslate = async () => {
        if (!text.trim() || !ai) {
            setError('Please enter text to translate. AI service might not be available.');
            return;
        }
        setIsLoading(true);
        setTranslatedText('');
        setDetectedLanguage('');
        setError('');

        try {
            // Step 1: Detect Language
            const detectionPrompt = `Identify the language of the following text. Respond with ONLY the name of the language (e.g., "Spanish", "French", "Japanese"): "${text}"`;
            const detectionResult = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: detectionPrompt,
            });
            const detected = detectionResult.text?.trim() || 'Unknown';
            setDetectedLanguage(detected);

            // Step 2: Translate
            const translationPrompt = `Translate the following text from ${detected} to ${targetLanguage}. Provide only the translation, without any additional commentary or quotation marks: "${text}"`;
            const translationResult = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: translationPrompt,
            });
            setTranslatedText(translationResult.text || '');
        } catch (err) {
            console.error("Gemini API error:", err);
            setError("Failed to translate. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to translate..."
                rows={4}
                className="w-full bg-brand-secondary border border-brand-accent rounded-md p-2 text-sm text-brand-highlight focus:ring-2 focus:ring-brand-blue transition-shadow"
                disabled={isLoading}
            />
            <div className="flex items-center gap-2">
                <label htmlFor="language-select" className="text-sm text-brand-light flex-shrink-0">Translate to:</label>
                <select
                    id="language-select"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full bg-brand-primary border border-brand-accent rounded-md p-2 text-brand-highlight focus:ring-2 focus:ring-brand-blue"
                    disabled={isLoading}
                >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
            </div>
            <Button onClick={handleTranslate} disabled={isLoading || !text.trim() || !ai} className="w-full">
                <Languages className="w-4 h-4 mr-2" />
                {isLoading ? 'Detecting & Translating...' : 'Translate'}
            </Button>
            
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded-md">{error}</p>}

            {translatedText && (
                <div className="p-3 bg-brand-secondary rounded-lg space-y-2">
                     <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-brand-highlight text-sm">Translation:</h3>
                        {detectedLanguage && (
                            <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                                Detected: {detectedLanguage}
                            </span>
                        )}
                     </div>
                     <p className="whitespace-pre-wrap text-sm">{translatedText}</p>
                </div>
            )}
        </div>
    );
};

export default Translator;